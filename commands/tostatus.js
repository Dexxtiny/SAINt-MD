import logger from "../utils/logger.js";

export default {
    name: "tostatus",
    description: "Post a quoted message to WhatsApp Status",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Check if quoted message exists
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Please reply to a text, image, or video message to post it to status." },
                    { quoted: message }
                );
                return;
            }

            // Handle text status
            if (quoted.conversation || quoted.extendedTextMessage) {
                const text = quoted.conversation || quoted.extendedTextMessage?.text;
                await client.sendMessage("status@broadcast", { text });
            }

            // Handle image status
            else if (quoted.imageMessage) {
                const buffer = await client.downloadMediaMessage({ message: { imageMessage: quoted.imageMessage } });
                await client.sendMessage("status@broadcast", { image: buffer, caption: args.join(" ") || "" });
            }

            // Handle video status
            else if (quoted.videoMessage) {
                const buffer = await client.downloadMediaMessage({ message: { videoMessage: quoted.videoMessage } });
                await client.sendMessage("status@broadcast", { video: buffer, caption: args.join(" ") || "" });
            }

            const response = `
${getStatusArt()}
📤 *TOSTATUS COMMAND EXECUTED*
${getStatusArt()}

✅ Quoted message has been posted to WhatsApp Status.  
⚡ Shared successfully with your contacts.

${getStatusArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing tostatus command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running tostatus command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getStatusArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📤─────────────────📤",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
