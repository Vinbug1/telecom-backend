import mongoose, { Document, Schema, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'client';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'is invalid'], // Basic email regex
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            //enum: ['admin', 'client'], // Restricts role to 'admin' or 'client'
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next: (err?: CallbackError) => void) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Call next with no error
    } catch (error) {
        next(error as CallbackError); // Explicitly cast error to CallbackError
    }
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
