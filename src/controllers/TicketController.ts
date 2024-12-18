import { Request, Response } from 'express';
import Ticket from '../models/Ticket';

class TicketController {
    // Create a new ticket
    static async createTicket(req: Request, res: Response): Promise<Response> {
        const { userId, derciption, status } = req.body;
        try {
            const newTicket = new Ticket({ userId, derciption, status });
            const savedTicket = await newTicket.save();
            return res.status(201).json({ message: 'Ticket created successfully', ticket: savedTicket });
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to create ticket' });
        }
    }

    // Get all tickets
    static async getAllTickets(req: Request, res: Response): Promise<Response> {
        try {
            const tickets = await Ticket.find();
            return res.json(tickets);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
        }
    }

    // Get a single ticket by ID
    static async getTicketById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const ticket = await Ticket.findById(id);
            if (!ticket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            return res.json(ticket);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch ticket' });
        }
    }

    // Update a ticket
    static async updateTicket(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { userId, derciption, status } = req.body;
        try {
            const updatedTicket = await Ticket.findByIdAndUpdate(
                id,
                { userId, derciption, status },
                { new: true, runValidators: true }
            );
            if (!updatedTicket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            return res.json({ message: 'Ticket updated successfully', ticket: updatedTicket });
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to update ticket' });
        }
    }

    // Delete a ticket
    static async deleteTicket(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const deletedTicket = await Ticket.findByIdAndDelete(id);
            if (!deletedTicket) {
                return res.status(404).json({ message: 'Ticket not found' });
            }
            return res.json({ message: 'Ticket deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to delete ticket' });
        }
    }
}

export default TicketController;
