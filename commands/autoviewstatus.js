import logger from "../utils/logger.js";

export default {
    name: "autoviewstatus",
    description: "Enable automatic viewing of WhatsApp status updates",
    category: "automation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AutoViewStatus mode in DB
            db.setConfig("autoViewStatus", true);

            const response = `
${getStatusArt()}
📲 *AUTOVIEWSTATUS MODE ENABLED*
${getStatusArt()}

✅ Bot will now automatically view all status updates.  
⚡ Active until disabled.

${getStatusArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autoviewstatus command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autoviewstatus command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getStatusArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📲─────────────────📲",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
