import logger from "../utils/logger.js";

export default {
    name: "getsettings",
    description: "View current bot settings and configurations",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Retrieve all settings from DB
            const settings = db.getAllConfigs();

            // Format settings nicely
            let formattedSettings = Object.entries(settings)
                .map(([key, value]) => `🔧 ${key}: ${value ? "✅ Enabled" : "❌ Disabled"}`)
                .join("\n");

            const response = `
${getSettingsArt()}
⚙️ *CURRENT BOT SETTINGS*
${getSettingsArt()}

${formattedSettings}

${getSettingsArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing getsettings command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error retrieving settings. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getSettingsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚙️─────────────────⚙️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
