import 'dotenv/config';
import logger from '../utils/logger.js';

const prefix = process.env.PREFIX || '!';

export default async (sock, cleanMsg, handler) => {
    try {
        // cleanMsg already has extractedText from bot.js
        const messageContent = cleanMsg.extractedText;
        
        if (!messageContent) {
            console.log('❌ No extracted text received');
            return;
        }
        
        const sender = cleanMsg.key.remoteJid;
        
        console.log(`📨 Processing: "${messageContent}" from ${sender}`);
        
        // Check prefix
        if (!messageContent.startsWith(prefix)) {
            console.log(`⏭️ No prefix ${prefix}`);
            return;
        }
        
        // Parse command
        const args = messageContent.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        
        if (!commandName) {
            console.log('❌ No command name');
            return;
        }
        
        console.log(`🎯 Command: ${commandName}`);
        
        // Get command
        const command = handler.getCommand(commandName);
        
        if (!command) {
            console.log(`❌ Unknown command: ${commandName}`);
            return await sock.sendMessage(sender, { 
                text: `❓ Unknown command: ${prefix}${commandName}` 
            }, { quoted: cleanMsg });
        }
        
        // Execute
        logger.info(`⚡ Command "${commandName}" from ${sender}`);
        await command.execute(cleanMsg, sock, args);
        
    } catch (error) {
        logger.error("💥 Error:", error);
        const jid = cleanMsg?.key?.remoteJid;
        if (jid) {
            await sock.sendMessage(jid, { text: "⚠️ Error processing command." });
        }
    }
};