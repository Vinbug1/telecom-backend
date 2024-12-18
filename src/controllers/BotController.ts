import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { PubSub } from '@google-cloud/pubsub';
import { v4 as uuidv4 } from 'uuid'; // For generating unique ticket IDs
import axios from 'axios'; // For making API calls (e.g., fetching billing details)


// Initialize Pub/Sub client and Nodemailer
const pubsub = new PubSub();
const topicName = 'unknown-message-topic'; // The topic you created in Google Cloud Pub/Sub
const subscriptionName = 'trainer-notification-subscription'; // Subscription to listen to

// Setup Nodemailer transporter (use your own SMTP server settings)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Path to your training data (we're using trainingdata.json now)
const trainingDataFile = path.join(__dirname, 'trainingdata.json');

// Define types for the training data and unknown messages
interface UnknownMessage {
    userId: string;
    message: string;
    timestamp: string;
}

interface TrainingData {
    unknownMessages: UnknownMessage[];
    responses: { [message: string]: string };
}

interface Ticket {
    ticketId: string;
    userId: string;
    issue: string;
    createdAt: string;
    status: string;
}

// Network Status Check
function checkNetworkStatus(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        try {
            const http = require('http');

            const options = {
                host: 'google.com',
                port: 80,
                timeout: 5000 // Timeout after 5 seconds
            };

            const req = http.get(options, (res: any) => {
                resolve(res.statusCode === 200); // If we get a 200 OK response, we're online
            });

            req.on('error', () => resolve(false)); // If there's an error (e.g., no internet), return false

            req.end();
        } catch (error) {
            console.error('Error checking network status:', error);
            resolve(false); // Return false if any error occurs
        }
    });
}

// Get Billing Details
async function getBillingDetails(userId: string): Promise<any> {
    try {
        // For the sake of this example, we will mock a billing details response.
        // Replace this with actual API calls to fetch billing data.

        // Example: Fetching billing details from an API (replace with real API)
        const response = await axios.get(`https://api.yourbillingservice.com/users/${userId}/billing`);

        // Return billing details or process as needed
        return response.data;
    } catch (error) {
        console.error('Error fetching billing details:', error);
        return { error: 'Failed to fetch billing details' };
    }
}

// Load existing training data (FAQs, responses)
function loadTrainingData(): TrainingData {
    try {
        const data = fs.readFileSync(trainingDataFile);
        const parsedData: TrainingData = JSON.parse(data.toString());
        return parsedData;
    } catch (err) {
        console.error('Error loading training data:', err);
        return { unknownMessages: [], responses: {} };
    }
}

// Save the training data to a JSON file
function saveTrainingData(data: TrainingData): void {
    try {
        fs.writeFileSync(trainingDataFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving training data:', err);
    }
}

// Notify the trainer via email
function sendEmailNotification(unknownMessage: UnknownMessage): void {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'trainer-email@example.com', // Replace with trainer's email
        subject: 'New Unknown Message for Bot',
        html: `
            <h3>New Unknown Message</h3>
            <p><strong>UserId:</strong> ${unknownMessage.userId}</p>
            <p><strong>Message:</strong> ${unknownMessage.message}</p>
            <p><strong>Timestamp:</strong> ${unknownMessage.timestamp}</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

// Function to handle incoming user messages
export async function handleUserMessage(req: Request, res: Response): Promise<void> {
    const { message, userId } = req.body;

    try {
        // Check if the network is available
        const isNetworkAvailable = await checkNetworkStatus();
        if (!isNetworkAvailable) {
            res.status(503).json({ message: 'Network unavailable. Please check your internet connection.' });
            return; // Ensure we return here after sending the response
        }

        // Fetch user billing details
        const billingDetails = await getBillingDetails(userId);

        // Load training data
        const trainingData = loadTrainingData();

        // Check if we have a response for this message
        if (trainingData.responses && trainingData.responses[message]) {
            // If a response exists, send it back to the user
            res.json({ response: trainingData.responses[message], billing: billingDetails });
        } else {
            // If no response exists, save the unknown message and notify the trainer
            const unknownMessage: UnknownMessage = {
                userId,
                message,
                timestamp: new Date().toISOString()
            };

            trainingData.unknownMessages = trainingData.unknownMessages || [];
            trainingData.unknownMessages.push(unknownMessage);
            saveTrainingData(trainingData);

            // Publish message to Google Cloud Pub/Sub
            const dataBuffer = Buffer.from(JSON.stringify(unknownMessage), 'utf8');
            await pubsub.topic(topicName).publish(dataBuffer);

            // Send email notification to the trainer
            sendEmailNotification(unknownMessage);

            res.json({
                response: "I'm sorry, I don't have an answer to that. Please hold on while I notify a trainer.",
                billing: billingDetails
            });
        }
    } catch (err) {
        console.error('Error handling user message:', err);
        res.status(500).json({ response: 'Internal server error' });
    }
}


// Add a new response to the system (Trainer Endpoint)
export async function addBotResponse(req: Request, res: Response): Promise<void> {
    const { message, response } = req.body;

    try {
        const trainingData = loadTrainingData();

        // Update training data with new response for the given message
        trainingData.responses[message] = response;

        saveTrainingData(trainingData);

        res.json({ status: 'success', message: 'Response added successfully.' });
    } catch (err) {
        console.error('Error adding response:', err);
        res.status(500).json({ status: 'error', message: 'Failed to add response.' });
    }
}

// Function to listen to the Pub/Sub subscription
async function listenForNotifications(): Promise<void> {
    const subscription = pubsub.subscription(subscriptionName);

    const messageHandler = (message: any) => {
        const unknownMessage: UnknownMessage = JSON.parse(message.data.toString());
        console.log('Received notification:', unknownMessage);

        // Send email notification to the trainer
        sendEmailNotification(unknownMessage);

        // Acknowledge message
        message.ack();
    };

    subscription.on('message', messageHandler);
}

// Start listening for notifications
listenForNotifications();

// Function to update a response for an unanswered message
export async function updateBotResponse(req: Request, res: Response): Promise<void> {
    const { message } = req.params;
    const { response } = req.body;

    try {
        // Load current training data
        const trainingData = loadTrainingData();

        // Check if the message exists in responses
        if (!trainingData.responses || !trainingData.responses[message]) {
            res.status(404).json({ status: 'error', message: 'Message not found in responses.' });
            return; // Ensure the function returns void after sending the response
        }

        // Update the response for the existing message
        trainingData.responses[message] = response;

        // Save the updated training data
        saveTrainingData(trainingData);

        res.json({ status: 'success', message: 'Bot response updated successfully.' });
    } catch (err) {
        console.error('Error updating response:', err);
        res.status(500).json({ status: 'error', message: 'Failed to update response.' });
    }
}

// Define a new endpoint for responding to a user message
export async function respondToUserMessage(req: Request, res: Response): Promise<void> {
    const { message } = req.params; // The message that needs a response
    try {
        // Load training data
        const trainingData = loadTrainingData();

        // Check if a response exists for the message
        if (trainingData.responses && trainingData.responses[message]) {
            // Send the response back to the user
            res.json({ response: trainingData.responses[message] });
        } else {
            res.status(404).json({ message: 'Response not found for this message.' });
        }
    } catch (err) {
        console.error('Error responding to user message:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Generate a ticket for a user
export async function generateTicket(req: Request, res: Response): Promise<void> {
    const { userId, issue } = req.body;

    if (!userId || !issue) {
        res.status(400).json({ message: 'UserId and Issue are required to generate a ticket.' });
        return;
    }

    try {
        const newTicket: Ticket = {
            ticketId: uuidv4(), // Generate a unique ticket ID
            userId,
            issue,
            createdAt: new Date().toISOString(),
            status: 'Open', // Initial ticket status
        };

        // Ideally, save the ticket to a database here. For now, we'll just log it.
        console.log('Ticket generated:', newTicket);

        // Send response back to the user
        res.json({
            message: 'Ticket generated successfully',
            ticket: newTicket
        });

    } catch (err) {
        console.error('Error generating ticket:', err);
        res.status(500).json({ message: 'Internal server error while generating the ticket.' });
    }
}

// Export the handlers for routes
module.exports = { handleUserMessage, addBotResponse, updateBotResponse, respondToUserMessage, generateTicket };
