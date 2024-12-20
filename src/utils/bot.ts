import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';

// Initialize the Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Your Discord bot token
const token = 'MTMxOTMyOTM4NTY3Mjg3MjAzNw.G-9fzp.0H63gVeJuVZlOb_8dZRKjYKnxi-7-TIa9s8AoM';

// When the bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Listen for messages in the server
client.on('messageCreate', async (message) => {
    // Ignore bot's own messages
    if (message.author.bot) return;

    // Check if the message includes "chatbot"
    if (message.content.toLowerCase().includes('chatbot')) {
        const userMessage = message.content.slice(7).trim(); // Get message after "chatbot"
        
        try {
            // Make a request to your backend API
            const response = await axios.post('http://localhost:5000/chatbot', { message: userMessage });
            
            // Send Eliza's response to the Discord channel
            message.reply(response.data.response);
        } catch (error) {
            console.error('Error with backend request:', error);
            message.reply("Sorry, I couldn't process your request right now.");
        }
    }
});

// Log in to Discord using your bot token
client.login(token);
