import express, { Request, Response } from 'express';
import TicketController from '../controllers/TicketController';

const router = express.Router();

// Create a new ticket
router.post('/', (req: Request, res: Response) => {
    TicketController.createTicket(req, res);
});

// Get all tickets
router.get('/', (req: Request, res: Response) => {
    TicketController.getAllTickets(req, res);
});

// Get a single ticket by ID
router.get('/:userId', (req: Request, res: Response) => {
    TicketController.getTicketById(req, res);
});

// Update a ticket
router.put('/:id', (req: Request, res: Response) => {
    TicketController.updateTicket(req, res);
});

// Delete a ticket
router.delete('/:id', (req: Request, res: Response) => {
    TicketController.deleteTicket(req, res);
});

export default router;
