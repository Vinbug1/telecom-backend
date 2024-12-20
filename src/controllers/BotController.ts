import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Ticket from '../models/Ticket'; // Import your Ticket model
import Billing from '../models/Bill'; // Import your Billing model

// Path to your training data (we're using trainingdata.json now)
const trainingDataFile = path.resolve(__dirname, '../utils/trainingdata.json');
let expectingBillingDetails = false;
let processedMessages = new Set();

// Define types for the training data and unknown messages
interface TrainingData {
    unknownMessages: { userId: string; message: string; timestamp: string }[];
    responses: { [message: string]: string };
}

// Load existing training data (FAQs, responses)
const loadTrainingData = () => {
    const data = fs.readFileSync(trainingDataFile, 'utf-8');
    return JSON.parse(data);
};

// Save training data to the file
function saveTrainingData(data: any) {
    try {
        fs.writeFileSync(trainingDataFile, JSON.stringify(data, null, 2)); // Save the JSON with pretty formatting
        console.log('Training data saved successfully');
    } catch (error) {
        console.error('Error saving training data:', error);
    }
}
// Function to fetch all messages with the default "I'm sorry" response
const fetchUnknownMessages = () => {
    const trainingData = loadTrainingData();
    return trainingData.filter(item => item.response === "I'm sorry, I don't have an answer to that.");
};

export async function addBotResponse(req: Request, res: Response): Promise<void> {
    const { message, response } = req.body; // Get the message and response from the request body

    try {
        // Load the existing training data
        const trainingData = loadTrainingData();

        // Find the message in the training data array
        const messageIndex = trainingData.findIndex((entry: any) => entry.message === message);

        if (messageIndex !== -1) {
            // If the message exists, update its response
            trainingData[messageIndex].response = response;
            console.log(`Updated response for message: "${message}"`);
        } else {
            // If the message is not found, return a 404 error response
            res.status(404).json({
                status: 'error',
                message: `Message "${message}" not found to update`,
            });
            return; // Early return to avoid proceeding further
        }

        // Save the updated training data back to the file
        saveTrainingData(trainingData);

        // Send a success response (no return value, just respond to the client)
        res.json({ status: 'success', message: 'Response updated successfully.' });
    } catch (err) {
        // Catch any errors and send a 500 error response
        console.error('Error adding or updating response:', err);
        res.status(500).json({ status: 'error', message: 'Failed to update response.' });
    }
};

// Handle network status request with or without coordinates
export async function handleRegionNetworkRequest(req: Request, res: Response): Promise<void> {
    const { message, latitude, longitude } = req.body; // User's message and location (if provided)

    try {
        if (latitude && longitude) {
            // If latitude and longitude are available, get region from geocoding
            const region = await getRegionFromCoordinates(latitude, longitude);
            res.json({
                response: `The network status for your region (${region}) is: [Network Status Here]`,
            });
        } else {
            // Otherwise, request the user to enable location services
            res.json({
                response: "I couldn't determine your region automatically. Could you please enable your location services?",
                action: 'requestLocation', // Indicating the client should prompt user for location
            });
        }
    } catch (error) {
        console.error("Error handling network request:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Geocoding function to get the region from latitude and longitude
const getRegionFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    if (!latitude || !longitude) {
        return 'Invalid coordinates';  // Return early if coordinates are invalid
    }

    try {
        const apiKey = '9b58e030dba947a7be4c3724437666a0'; // Replace with your OpenCage API key
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

        const response = await axios.get(url);

        // Check if the response has a valid result
        if (response.status === 200 && response.data.results.length > 0) {
            const result = response.data.results[0].components;
            const country = result.country || 'Unknown Country';
            const city = result.city || result.town || result.village || 'Unknown City';
            const region = `${city}, ${country}`;

            // Log the region to the console before sending the response
            console.log('Region found:', region);

            return region; // Return the city and country (or fallback to unknowns)
        } else {
            const unknownRegion = 'Unknown Region';
            console.log('No valid region found:', unknownRegion);
            return unknownRegion;
        }
    } catch (error) {
        console.error('Error fetching region from coordinates:', error);
        const errorRegion = 'Unknown Region';
        console.log('Error region:', errorRegion);
        return errorRegion;
    }
};

export async function createBillingRecord(req: Request, res: Response, { userId, billingAddress, amount, status, description }) {
    try {
        console.log("Received payload:", req.body);

        // Validate input fields
        if (!userId || !billingAddress || !amount || !status || !description) {
            throw new Error("Missing required fields: Ensure all fields are provided.");
        }

        // Check if a ticket for the same user already exists (optional, based on your use case)
        const existingTicket = await Ticket.findOne({ userId, description: `Billing record created: ${description}`, status: 'open' });

        if (existingTicket) {
            console.log("A ticket for this billing already exists.");
            return {
                message: "A billing record with the same details already exists.",
                data: { ticket: existingTicket },
            };
        }

        // Create and save a new ticket
        const newTicket = new Ticket({
            userId,
            description: `Billing record created: ${description}`,
            status: 'open',
        });
        const savedTicket = await newTicket.save();

        // Create and save the billing record
        const newBilling = new Billing({
            userId,
            billingAddress,
            amount,
            status,
            description,
            ticketId: savedTicket._id,
        });
        const savedBilling = await newBilling.save();

        // Return success message and data
        return {
            message: "Billing record and ticket created successfully!",
            data: { billing: savedBilling, ticket: savedTicket },
        };
    } catch (error) {
        console.error("Error creating billing record:", error);
        res.status(500).json({ response: 'Error creating the billing record.' });
        throw error; // Propagate the error to the caller for further handling
    }
}

// In-memory set to track processed billing messages
export async function handleUserMessage(req: Request, res: Response) {
    const { message, userId, latitude, longitude } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ response: 'Invalid message format.' });
    }

    if (!userId) {
        return res.status(400).json({ response: 'User ID is missing.' });
    }

    const lowerMessage = message.toLowerCase().trim();
    console.log('Processed message:', lowerMessage);

    // Step 1: Detect "bill" in the message and prompt for billing details
    if (lowerMessage.includes('bill')) {
        console.log('Detected "bill" in the message. Prompting for billing details.');

        // Check if this message has already been processed
        if (processedMessages.has(lowerMessage)) {
            console.log("This billing message has already been processed.");
            return res.json({
                response: 'This billing record has already been processed.'
            });
        }

        // Set state to expect billing details
        expectingBillingDetails = true;

        return res.json({
            response: 'Please provide the following details to create your billing record: billing address, amount, status, description (separated by commas). Example: "address, 100, pending, description".'
        });
    }

    // Step 2: If the system is expecting billing details, process them
    if (expectingBillingDetails) {
        console.log('Processing billing details.');

        // Parse the billing message (expecting 4 comma-separated values)
        const billDetails = lowerMessage.split(',').map((item) => item.trim());
        console.log('Parsed bill details:', billDetails);

        // Ensure that 4 billing details are provided
        if (billDetails.length === 4) {
            const [billingAddress, amount, status, description] = billDetails;

            try {
                // Call createBillingRecord to create the billing record
                const result = await createBillingRecord(req, res, {
                    userId,
                    billingAddress,
                    amount,
                    status,
                    description,
                });

                console.log('createBillingRecord result:', result);

                if (result.message === 'Billing record and ticket created successfully!') {
                    // Mark this message as processed
                    processedMessages.add(lowerMessage);

                    // Reset the state after processing the billing details
                    expectingBillingDetails = false;

                    return res.json({ response: 'Your bill has been created successfully!' });
                } else {
                    return res.json({ response: `Failed to create the bill: ${result.message}` });
                }
            } catch (error) {
                console.error('Error creating billing record:', error);
                // Reset state in case of error
                expectingBillingDetails = false;
                return res.status(500).json({ response: 'Error creating the billing record.' });
            }
        } else {
            console.log('Incorrect number of billing details provided.');
            return res.json({
                response: 'Please provide the correct details: billing address, amount, status, description (separated by commas).',
            });
        }
    }

    // Step 3: Detect "network" in the message and respond with network status
    if (lowerMessage.includes('network')) {
        console.log('Detected "network" in the message. Fetching network status.');

        // If the user provided location coordinates, call the handleRegionNetworkRequest
        if (latitude && longitude) {
            // Call handleRegionNetworkRequest function with the provided latitude and longitude
            await handleRegionNetworkRequest(req, res);
            return;
        }

        // Otherwise, ask the user to enable location services
        return res.json({
            response: "I couldn't determine your region automatically. Could you please enable your location services?",
            action: 'requestLocation', // Indicating the client should prompt user for location
        });
    }

    // Step 4: If it's not related to billing or network, check the training data
    const trainingData = loadTrainingData();

    const responseObj = trainingData.find((item) => item.message.toLowerCase() === lowerMessage);

    if (responseObj) {
        // If found in training data, return the response
        return res.json({ response: responseObj.response });
    }

    // If no match in training data, add new message to training data
    const newMessage = {
        message,
        response: "I'm sorry, I don't have an answer to that.",
    };

    trainingData.push(newMessage);
    saveTrainingData(trainingData);

    console.log('No match in training data. Adding new entry.');
    return res.json({ response: newMessage.response });
}


// Endpoint to get all unknown messages with their failed responses
export async function getUnknownMessages(req: Request, res: Response): Promise<void> {
    try {
        // Await the result of fetchUnknownMessages if it's a promise or async function
        const unknownMessages = await fetchUnknownMessages();

        // Send the unknown messages and their responses to the frontend
        res.json({ unknownMessages });
    } catch (err) {
        console.error('Error fetching unknown messages:', err);
        res.status(500).json({ response: 'Internal server error' });
    }
}

// Export the handlers for routes
module.exports = { handleUserMessage, addBotResponse, getUnknownMessages };