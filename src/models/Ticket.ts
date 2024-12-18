import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITicket extends Document {
    userId: string;
    derciption: string;
    status: 'open' | 'closed' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema<ITicket> = new Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        trim: true,
    },
    derciption: {
        type: String,
        required: [true, 'description is required'],
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
