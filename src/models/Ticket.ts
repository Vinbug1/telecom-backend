import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITicket extends Document {
    userId: { type: String, required: true },  // Remove the 'unique' constraint here
    description: string;
    status: 'open' | 'closed' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema<ITicket> = new Schema({
    userId: {
        type: String,
        required: true,
    },
    description: {
        type: String,  // Fixed spelling here
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'pending'],
        default: 'open',
    },
}, {
    timestamps: true,
    versionKey: false,
});


const Ticket: Model<ITicket> = mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
