import { Schema, model, Document } from 'mongoose';

// Define the structure of the Billing model
interface IBilling extends Document {
    userId: string;  // Unique identifier for the user
    billingAddress:String;
    paymentMethod: {
        type: string;  // E.g., 'Credit Card', 'PayPal'
        details: string;  // E.g., masked credit card number or PayPal ID
    };
    amount: number;  // Amount in the desired currency (e.g., USD)
    status: 'Paid' | 'Pending' | 'Failed';  // Payment status
    createdAt: Date;
    updatedAt: Date;
}

// Billing schema
const billingSchema = new Schema<IBilling>({
    userId: { type: String, required: true, unique: true },
    billingAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    paymentMethod: {
        type: { type: String, required: true },
        details: { type: String, required: true }
    },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed'], required: true },
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create and export the model
const Billing = model<IBilling>('Billing', billingSchema);

export default Billing;
