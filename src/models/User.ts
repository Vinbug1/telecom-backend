import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
}

const userSchema: Schema<IUser> = new Schema({
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
        match: [/\S+@\S+\.\S+/, 'is invalid'],  // Add a basic email regex
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
