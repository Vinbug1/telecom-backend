import { Router } from 'express';
import { handleUserMessage, addBotResponse, getUnknownMessages } from '../controllers/BotController';

const botRouter: Router = Router();

// Route to handle incoming user messages
botRouter.post('/message', handleUserMessage);

// Route to add a new response to the bot
botRouter.post('/add', addBotResponse);

// Route to get unknown messages
botRouter.get('/unknown', getUnknownMessages);

export default botRouter;
