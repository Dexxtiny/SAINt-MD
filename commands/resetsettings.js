import logger from "../utils/logger.js";

export default {
    name: "resetsettings",
    description: "Reset all bot settings to default values",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Clear all custom settings in DB
            db.resetAllConfigs();

            const response = `
${getResetArt()}
🔄 *RESETSETTINGS EXECUTED*
${getResetArt()}

✅ All bot settings have been restored to default.  
⚡ Custom configurations (autoread, autoreact, mode, badword list, etc.) are now cleared.  
📌 Bot is back to factory defaults.

${getResetArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing resetsettings command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running resetsettings command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getResetArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔄─────────────────🔄",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
