import logger from "../utils/logger.js";

export default {
    name: "autoviewonce",
    description: "Enable automatic saving of view-once media",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AutoViewOnce mode in DB
            db.setConfig("autoViewOnce", true);

            const response = `
${getViewOnceArt()}
👁️ *AUTOVIEWONCE MODE ENABLED*
${getViewOnceArt()}

✅ All view-once media will now be auto-saved as normal files.  
⚡ Active until disabled.

${getViewOnceArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autoviewonce command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autoviewonce command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getViewOnceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👁️─────────────────👁️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
