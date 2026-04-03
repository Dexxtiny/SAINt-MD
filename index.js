import 'dotenv/config';
import startSaint from './bot.js'; // Points to your new modular bot file
// import logger from './utils/logger.js'; // Use if you have a logger, otherwise use console
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import supabaseSessionRestorer from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// HTTP Server for Uptime Checks (Keeps bot alive on Render/Koyeb)
const server = http.createServer((req, res) => {
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'OK',
            service: 'SAINT MD',
            time: new Date().toISOString()
        }));
    } else {
        res.writeHead(200);
        res.end('SAINT MD IS ACTIVE ✅');
    }
});

async function initializeBot() {
    try {
        displayBanner();
        
        const supabaseRestorer = supabaseSessionRestorer;
        
        // 1. Supabase Session Restoration
        if (process.env.SESSION_ID) {
            console.log(`\x1b[34m%s\x1b[0m`, `🔍 Supabase: Attempting to restore session [${process.env.SESSION_ID}]`);
            const restoreResult = await supabaseRestorer.restoreSession();
            
            if (restoreResult.success) {
                console.log(`\x1b[32m%s\x1b[0m`, `✅ Supabase: Session restored successfully!`);
            } else {
                console.log(`\x1b[33m%s\x1b[0m`, `❌ Supabase: Restore failed: ${restoreResult.error}`);
                console.log("💡 Falling back to local session check...");
            }
        }

        // 2. Check if creds.json actually exists now
        if (!sessionExists()) {
            console.log("\x1b[31m%s\x1b[0m", "\n❌ Authentication Failure: No WhatsApp session found.");
            console.log("💡 Fixes:");
            console.log("   1. Check your Supabase credentials (URL/KEY)");
            console.log("   2. Ensure SESSION_ID matches an ID in your Supabase bucket");
            console.log("   3. Or manually place creds.json in: ./sessions/");
            
            // Helpful search for available sessions
            const availableSessions = await supabaseRestorer.searchSessions();
            if (availableSessions && availableSessions.length > 0) {
                console.log("\n📋 Found these Session IDs in Supabase:");
                availableSessions.forEach(session => {
                    console.log(`   📁 ID: ${session.sessionId}`);
                });
            }
            process.exit(1);
        }
        
        // 3. Start the Core Saint MD Bot
        console.log("\x1b[35m%s\x1b[0m", "🚀 INITIALIZING SAINT MD CORE...");
        
        // This calls the export default function from your bot.js
        await startSaint();
        
    } catch (error) {
        console.error("\x1b[31m%s\x1b[0m", "FATAL ERROR during startup:", error.message);
        process.exit(1);
    }
}

function displayBanner() {
    console.log("\x1b[36m%s\x1b[0m", "\n" + "═".repeat(50));
    console.log("\x1b[36m%s\x1b[0m", "🤖          SAINT MD WHATSAPP BOT (PRO)          🤖");
    console.log("\x1b[36m%s\x1b[0m", "═".repeat(50));
}

function sessionExists() {
    // Looks for sessions/creds.json in the current directory
    const sessionPath = path.join(__dirname, "sessions", "creds.json");
    return fs.existsSync(sessionPath);
}

function gracefulShutdown(signal) {
    console.log("\n");
    console.log(`\x1b[33m%s\x1b[0m`, `🛑 Shutting down (Signal: ${signal})...`);
    server.close(() => {
        process.exit(0);
    });
}

// Start HTTP server then Init Bot
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[32m%s\x1b[0m`, `📡 Uptime service active on port ${PORT}`);
    initializeBot();
});

// System Event Listeners
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    console.error("UNCAUGHT EXCEPTION:", error);
});
process.on("unhandledRejection", (reason) => {
    console.error("UNHANDLED REJECTION:", reason);
});
