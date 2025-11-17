import dotenv from 'dotenv';
dotenv.config();

import Bot from './core/bot.js';
import logger from './utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MegaSessionManager from './mega.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeBot() {
    try {
        displayBanner();
        
        // Initialize Mega session manager
        const megaManager = new MegaSessionManager();
        const megaResult = await megaManager.initialize();
        
        if (!megaResult.success) {
            console.log(`\n❌ Mega session download failed: ${megaResult.error}`);
        }
        
        // Check if session exists after Mega download
        if (!sessionExists()) {
            console.log("\n❌ No WhatsApp session found.");
            console.log("\n💡 To use this bot:");
            console.log("   1. Visit the pairing service to get a session");
            console.log("   2. Or set SESSION_ID in .env to restore from Mega");
            console.log("   3. Place creds.json in the sessions/ folder");
            console.log("\n📁 Current sessions directory: ./sessions/");
            process.exit(1);
        }
        
        logger.info("Starting Savy DNI Bot...");
        
        // Initialize and start the bot
        const bot = new Bot();
        await bot.initialize();
        
        logger.success("✅ Bot is now running and connected to WhatsApp!");
        
        // Display bot status
        const status = bot.getStatus();
        console.log("\n📊 Bot Status:");
        console.log(`   Connected: ${status.isConnected ? "✅" : "❌"}`);
        console.log("   Session: ✅ Found and loaded");
        console.log(`   Commands: ${status.commandCount}`);
        console.log("\n💡 The bot is now running. Press Ctrl+C to stop.");
        
    } catch (error) {
        logger.error("Failed to start bot:", error.message);
        
        if (error.message.includes("No sessions available") || error.message.includes("creds.json")) {
            console.log("\n❌ Session authentication failed.");
            console.log("\n💡 The creds.json file may be invalid or expired.");
            console.log("   Please obtain a new creds.json file from the pairing service.");
        } else {
            console.log("\n💡 Error details:", error.message);
        }
        process.exit(1);
    }
}

function displayBanner() {
    console.log("\n" + "═".repeat(50));
    console.log("🤖  S A V Y   D N I   W H A T S A P P   B O T  🤖");
    console.log("═".repeat(50));
}

function sessionExists() {
    try {
        return fs.existsSync(path.join(__dirname, "sessions", "creds.json"));
    } catch (error) {
        logger.error("Error checking session:", error);
        return false;
    }
}

function gracefulShutdown(signal) {
    console.log("\n");
    logger.info(`Received ${signal}, shutting down...`);
    process.exit(0);
}

// Process event handlers
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the application
initializeBot();