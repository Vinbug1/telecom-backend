import { Schema, model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

// Define the structure of the Billing model
interface IBilling extends Document {
    userId: string;
    ticketId: ObjectId;  // Link to the Ticket model using ObjectId
    billingAddress: string;
    description: string;
    amount: number;  // Amount in the desired currency (e.g., USD)
    status: 'paid' | 'pending' | 'failed';  // Payment status
    createdAt: Date;
    updatedAt: Date;
}

// Billing schema
const billingSchema = new Schema<IBilling>({
    userId: { type: String, required: true },
    billingAddress: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'pending', 'failed'], required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },  // ticketId is optional now
}, {
    timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create and export the Billing model
const Billing = model<IBilling>('Billing', billingSchema);

export default Billing;
