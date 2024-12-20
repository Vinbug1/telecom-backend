
# Overview

MongoDB. It provides essential APIs to handle telecommunications-related functionalities. The backend is structured to be scalable and maintainable, with modern practices and tools. Additionally, a chatbot was manually built due to issues with the eliza-framework, and the project has been Dockerized for easier deployment and scaling.
 The chatbot functionality, however, is implemented on the frontend, with the backend offering a controller to interact with the bot.



## Technologies Used
 * Node.js: JavaScript runtime for building the server.
 * TypeScript: Type-safe language that provides enhanced developer experience and error checking.
 * MongoDB: NoSQL database used to store data related to the telecom service.
 * Express.js: Web framework for building APIs and handling requests.
 * Docker: Containerization tool for packaging the app with its environment and dependencies.
 * Frontend Interaction: While the chatbot itself is implemented on the frontend, the backend provides a controller to manage interaction with the chatbot

## Setup and Installation
To set up and run the telecom backend locally, follow the steps below.

# Prerequisites
Ensure you have the following installed:
*  Node.js (preferably the latest LTS version): Download Node.js
*  Docker: [Install Docker]
*  MongoDB: Either use a local MongoDB instance or connect to a cloud-based service like MongoDB Atlas.

## Clone the Repository: 
git clone https://github.com/Vinbug1/telecom-backend.git
cd telecom-backend

## Install Dependencies
Install the required Node.js dependencies using npm: `npm install`

## Configure Environment Variables
Create a .env file in the root of the project and add the following environment variables:
  MONGODB_URI=mongodb://localhost:27017/telecom
  PORT=5000
  SECRET_KEY=your-secret-key

* MONGODB_URI: MongoDB connection string (update if using MongoDB Atlas or another provider).
* PORT: Port number the backend server will listen on.
* SECRET_KEY: Secret key for JWT authentication.
  
## Running Locally
To start the server locally, use the following command:`npm run dev`
* This will start the backend on http://localhost:5000.

# Running with Docker
To run the project inside a Docker container, follow these steps:
Build the Docker image: `docker build -t telecom-backend`.
Run the Docker container:`docker run -p 5000:5000 telecom-backend`
The backend will now be accessible at http://localhost:5000 inside the Docker container.

## Features
 * User Authentication: API routes for user login, registration, and JWT-based authentication.
 * Billing: Create, view, and update billing information for users.
 * Network Status: Provide real-time network status based on the user’s location.
 * Frontend Interaction: While the chatbot itself is implemented on the frontend, the backend provides a controller to manage interaction with the chatbot.

## Manual Chatbot Implementation
This captures the idea that the chatbot is implemented on the frontend, with the backend providing a controller to interact with it to:
* Respond to queries related to billing.
* Detect keywords like "bill" and prompt users for relevant billing information.
* Handle queries about network status and return appropriate responses.
* Handle and store new messages in the system as part of a learning mechanism for the bot.
* Responding to network status queries.
* Providing feedback and additional functionality based on user inputs.


## Troubleshooting
 Issue with eliza-framework Installation: If you encounter the error when trying to install the eliza-framework:
  ![Error Screen Screenshot](./src/image/Screenshot%202024-12-20%20at%2012.02.09.png)
  npm error code E404
  npm error 404 Not Found - GET https://registry.npmjs.org/eliza-framework - Not found.
 This indicates that the package could not be found in the NPM registry. In this case, a custom chatbot was manually implemented as a replacement.

 * MongoDB Connection Issues: Ensure MongoDB is running locally or ensure that the connection string in .env is correct if using MongoDB Atlas or another cloud provider.

 * Docker Issues: If the Docker container fails to start, ensure that Docker is installed correctly and that you have sufficient resources allocated for Docker to run.

## API Endpoints
* POST /api/users/register: Register a new user.
* POST /api/users/login: Log in a user and get a JWT token.
* GET /api/billing: Get the billing information.
* POST /api/billing: Create a new billing record.
* GET /api/bot/message: To chat with chatbot.MongoDB Connection Issues: Ensure MongoDB is running locally or ensure that the connection string in .env is correct if using MongoDB Atlas or another cloud provider.

Docker Issues: If the Docker container fails to start, ensure that Docker is installed correctly and that you have sufficient resources allocated for Docker to run.

## API Endpoints
 * POST /api/users/register: Register a new user.
 * POST /api/users/login: Log in a user and get a JWT token.
 * GET /api/bills/: Get all the billing information.
 * POST /api/bills: Create a new billing record.
 * GET /api/tickets/: Get all the ticket information.
 * POST /api/tickets/: Create a new ticket information.
 * POST /api/bot/message: To start chating with the chatbot.
 * POST /api/bot/add: To train the chatbot based on the input with out response.
 * POST /api/bot/unknown: To fetch all the input with out response saved by the chatbot.




