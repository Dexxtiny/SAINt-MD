import logger from "../utils/logger.js";

export default {
    name: "antidelete",
    description: "Enable anti-delete protection to prevent message deletion",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AntiDelete mode in DB
            db.setConfig("antiDelete", true);

            const response = `
${getDeleteArt()}
🛡️ *ANTIDELETE MODE ENABLED*
${getDeleteArt()}

✅ Deleted messages will now be recovered and shown.  
⚡ Protection active for this group.

${getDeleteArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing antidelete command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running antidelete command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getDeleteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🛡️─────────────────🛡️",
        "⊱──────── 🗑️ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
