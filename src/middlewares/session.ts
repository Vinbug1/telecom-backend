import express from 'express';
import session from 'express-session';
//import { handleUserMessage } from '../controllers/BotController'; // Adjust the import based on your file structure

const app = express();

// Middleware setup to parse JSON bodies
app.use(express.json());  // Make sure this is before the session middleware

// Session middleware setup
app.use(session({
    secret: 'your-secret-key', // Use a strong secret key
    resave: false,             // Don't save session if it wasn't modified
    saveUninitialized: true,   // Create a session even if it's not modified
    cookie: { 
        secure: false,         // For local development, set to false (change to true in production with HTTPS)
        httpOnly: true,        // Ensure the cookie is sent only through HTTP requests (no access through JavaScript)
        maxAge: 60000,         // Session expiration time (1 minute for testing)
    },
}));

// Your route handler for handling user messages
//app.post('/api/bot/message', handleUserMessage);

// Starting the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
