import express from 'express';
import ticketRouter from '../src/routes/ticketRouter';
import userRouter from '../src/routes/userRouter';
import botRouter from '../src/routes/botRouter';
import billRouter from '../src/routes/billRouter';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the cors package


dotenv.config();
const app = express();

app.use(express.json());
// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    credentials: true, // Allow credentials (if needed)
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers

}));

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the environment variables');
}
mongoose.connect(mongoUri).then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Ticket routes
app.use('/api/tickets', ticketRouter);
app.use('/api/users', userRouter);
app.use('/api/bot', botRouter);
app.use('/api/bills', billRouter);

// Start server
const PORT = process.env.PORT ?? 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

