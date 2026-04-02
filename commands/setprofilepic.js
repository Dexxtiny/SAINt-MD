import logger from "../utils/logger.js";
import fs from "fs";

export default {
    name: "setprofilepic",
    description: "Set or update the bot's WhatsApp profile picture",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Check if quoted message contains an image
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted || !quoted.imageMessage) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Please reply to an image message to set it as the bot's profile picture." },
                    { quoted: message }
                );
                return;
            }

            // Extract image
            const imageMessage = quoted.imageMessage;
            const buffer = await client.downloadMediaMessage({ message: { imageMessage } });

            // Update profile picture
            await client.updateProfilePicture("me", buffer);

            const response = `
${getPicArt()}
🖼 *SETPROFILEPIC COMMAND EXECUTED*
${getPicArt()}

✅ Bot profile picture has been updated successfully.  
⚡ Fresh new look applied.

${getPicArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing setprofilepic command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running setprofilepic command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getPicArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼─────────────────🖼",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
