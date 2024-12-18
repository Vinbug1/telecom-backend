import nodemailer from 'nodemailer';
import { PubSub } from '@google-cloud/pubsub';
import fs from 'fs';
import path from 'path';
import { ElizaBot } from 'elizabot';

interface UnknownMessage {
    userId: string;
    message: string;
    timestamp: string;
}

interface TrainingData {
    unknownMessages: UnknownMessage[];
}

// Initialize Pub/Sub client and Nodemailer
const pubsub = new PubSub();
const topicName = 'unknown-message-input'; // The topic you created in Google Cloud Pub/Sub
const subscriptionName = 'trainer-notification-subscription'; // Subscription to listen to

// Setup Nodemailer transporter (use your own SMTP server settings)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

// Initialize ElizaBot
const elizaBot = new ElizaBot();

// Path to your training data
const trainingDataFile = path.join(__dirname, 'training_data.json');

// Load and save training data functions
function loadTrainingData(): TrainingData {
    try {
        const data = fs.readFileSync(trainingDataFile);
        return JSON.parse(data.toString()) as TrainingData; // Convert Buffer to string
    } catch (err) {
        console.error('Error loading training data:', err);
        return { unknownMessages: [] };
    }
}

function saveTrainingData(data: TrainingData): void {
    try {
        fs.writeFileSync(trainingDataFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving training data:', err);
    }
}

// Notify trainer via email
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
async function handleUserMessage(req: { body: { message: string; userId: string } }, res: { json: (data: { response: string }) => void }): Promise<void> {
    const { message, userId } = req.body;
    const response = await elizaBot.getResponse(message);

    if (response) {
        res.json({ response: response });
    } else {
        const trainingData = loadTrainingData();
        const unknownMessage: UnknownMessage = {
            userId,
            message,
            timestamp: new Date().toISOString()
        };

        trainingData.unknownMessages = trainingData.unknownMessages || [];
        trainingData.unknownMessages.push(unknownMessage);
        saveTrainingData(trainingData);

        // Publish message to Google Cloud Pub/Sub
        const dataBuffer = Buffer.from(JSON.stringify(unknownMessage), 'utf8'); // Explicit encoding
        await pubsub.topic(topicName).publish(dataBuffer);
        
        res.json({
            response: "I'm sorry, I don't have an answer to that. Please hold on while I notify a trainer."
        });
    }
}

// Function to listen to the Pub/Sub subscription
async function listenForNotifications(): Promise<void> {
    const subscription = pubsub.subscription(subscriptionName);

    const messageHandler = (message: { data: Buffer; ack: () => void }) => {
        const unknownMessage: UnknownMessage = JSON.parse(message.data.toString());
        console.log('Received notification:', unknownMessage);

        // Send email notification
        sendEmailNotification(unknownMessage);

        // Acknowledge message
        message.ack();
    };

    subscription.on('message', messageHandler);
}

export { handleUserMessage, listenForNotifications };

// Start listening for notifications
listenForNotifications();
