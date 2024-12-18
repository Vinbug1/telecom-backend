import express from 'express';
import ticketRouter from '../src/routes/ticketRouter';
import userRouter from '../src/routes/userRouter';
import botRouter from '../src/routes/botRouter';
import billRouter from '../src/routes/billRouter';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());

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
app.use('/api/bots', botRouter);
app.use('/api/bills', billRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
