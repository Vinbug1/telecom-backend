import { Router } from 'express';
import { handleUserMessage, addBotResponse, updateBotResponse, respondToUserMessage, generateTicket } from '../controllers/BotController'; // Adjust the import path if necessary

const botRouter: Router = Router();

// Route to handle incoming user messages
botRouter.post('/message', handleUserMessage);

// Route to add a new response to the bot
botRouter.post('/add', addBotResponse);

// Route to update an existing bot response for a message
botRouter.put('/update-response/:message', updateBotResponse);

// Route to respond to a user's message
botRouter.post('/respond-to-message', respondToUserMessage); 

// New route for ticket generation
botRouter.post('/generate-ticket', generateTicket);

export default botRouter;
