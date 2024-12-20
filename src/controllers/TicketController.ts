import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import User from '../models/User'; // Assuming you have a User model

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

// Get user details and tickets by userId
static async getTicketById(req: Request, res: Response): Promise<Response> {
    try {
        const userId = req.params.userId;  // Use userId from the route params
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' }); // 400 Bad Request if userId is missing
        }

        // Fetch user details using userId
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // 404 Not Found if user does not exist
        }

        // Fetch all tickets associated with the userId
        const tickets = await Ticket.find({ userId });  // Find all tickets for the current user
        
        // Check if there are no tickets found
        if (tickets.length === 0) {
            return res.status(404).json({ message: 'No tickets found for this user' }); // 404 Not Found if no tickets are found
        }

        // Return the user details and all tickets as an array in the response
        return res.status(200).json({
            message: 'User details and tickets retrieved successfully', // 200 OK
            user,   // Include the user details in the response
            tickets: tickets.map(ticket => ({
                ticketId: ticket._id, // The ticket ID
                description: ticket.description, // The description of the ticket
                status: ticket.status,  // The current status of the ticket
                createdAt: ticket.createdAt, // The creation date of the ticket
                updatedAt: ticket.updatedAt, // The last update date of the ticket
            })),
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Failed to fetch user details and tickets' }); // 500 Internal Server Error if something goes wrong
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
