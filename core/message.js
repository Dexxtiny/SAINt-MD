import 'dotenv/config';
import logger from '../utils/logger.js';

const prefix = process.env.PREFIX || '!';
const ownerNumber = process.env.OWNER_NUMBER + "@s.whatsapp.net";

export default async (sock, m, handler) => {
    try {
        if (!m.messages[0]) return;
        const msg = m.messages[0];
        if (msg.key.fromMe) return; // Ignore bot's own messages

        const jid = msg.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const messageContent = msg.message?.conversation || 
                               msg.message?.extendedTextMessage?.text || 
                               msg.message?.imageMessage?.caption || "";

        // Check for prefix
        if (!messageContent.startsWith(prefix)) return;

        // Parse command and args
        const args = messageContent.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Get command from handler
        const command = handler.getCommand(commandName);
        if (!command) return;

        // --- Metadata & Permissions ---
        const sender = msg.key.participant || msg.key.remoteJid;
        const isOwner = sender === ownerNumber;
        
        let groupMetadata = isGroup ? await sock.groupMetadata(jid) : null;
        let participants = isGroup ? groupMetadata.participants : [];
        let admins = participants.filter(p => p.admin).map(p => p.id);
        
        const isSenderAdmin = admins.includes(sender);
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + "@s.whatsapp.net");

        // --- Validation Checks ---
        
        // 1. Owner Only Check
        if (command.ownerOnly && !isOwner) {
            return await sock.sendMessage(jid, { text: "❌ This command is restricted to the Bot Owner." }, { quoted: msg });
        }

        // 2. Group Only Check
        if (command.groupOnly && !isGroup) {
            return await sock.sendMessage(jid, { text: "❌ This command can only be used in groups." }, { quoted: msg });
        }

        // 3. Admin Only Check
        if (command.adminOnly && !isSenderAdmin && !isOwner) {
            return await sock.sendMessage(jid, { text: "❌ You must be a group admin to use this." }, { quoted: msg });
        }

        // 4. Bot Admin Check (If the command needs to kick/promote/link)
        if (command.botAdminRequired && !isBotAdmin) {
            return await sock.sendMessage(jid, { text: "❌ I need to be an admin to perform this action." }, { quoted: msg });
        }

        // --- Execute Command ---
        logger.info(`Command ${commandName} executed by ${sender} in ${isGroup ? 'Group' : 'Private'}`);
        
        await command.execute(sock, msg, {
            args,
            isGroup,
            isOwner,
            isAdmin: isSenderAdmin,
            isBotAdmin,
            payload: messageContent
        });

    } catch (error) {
        logger.error("Error in message handler:", error);
    }
};
