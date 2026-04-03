import 'dotenv/config';
import logger from '../utils/logger.js';

const prefix = process.env.PREFIX || '!';

function extractMessageContent(msg) {
    if (!msg.message) return "";

    if (msg.message.ephemeralMessage) {
        msg.message = msg.message.ephemeralMessage.message;
    }
    if (msg.message.viewOnceMessage) {
        msg.message = msg.message.viewOnceMessage.message;
    }

    return msg.message.conversation ||
           msg.message.extendedTextMessage?.text ||
           msg.message.imageMessage?.caption ||
           msg.message.videoMessage?.caption ||
           msg.message.documentMessage?.caption ||
           "";
}

export default async (sock, chatUpdate, handler) => {
    try {
        const msg = chatUpdate.messages?.[0];
        if (!msg || !msg.message || msg.key.fromMe) return;

        // Ignore status broadcasts
        if (msg.key.remoteJid === 'status@broadcast') return;

        const messageContent = extractMessageContent(msg);
        if (!messageContent.startsWith(prefix)) return;

        const args = messageContent.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = handler.getCommand(commandName);
        if (!command) {
            return sock.sendMessage(msg.key.remoteJid, { 
                text: `❓ Unknown command: ${prefix}${commandName}` 
            }, { quoted: msg });
        }

        // Log command execution
        logger.info(`⚡ Command "${commandName}" received from ${msg.key.remoteJid}`);

        // 👉 Pass in (message, client, args) exactly in that order
        await command.execute(msg, sock, args);

    } catch (error) {
        logger.error("💥 Error in message handler:", error);
        const jid = chatUpdate.messages?.[0]?.key?.remoteJid;
        if (jid) {
            await sock.sendMessage(jid, { text: "⚠️ Oops, something went wrong while processing your command." });
        }
    }
};
