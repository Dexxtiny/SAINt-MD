import logger from "../utils/logger.js";

export default {
    name: "settimezone",
    description: "Set a new timezone for the bot",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a valid timezone (e.g., Africa/Lagos, America/New_York)." },
                    { quoted: message }
                );
                return;
            }

            const newTimezone = args[0];

            // Save new timezone in DB
            db.setConfig("botTimezone", newTimezone);

            const response = `
${getTimezoneArt()}
🌍 *SETTIMEZONE SUCCESSFUL*
${getTimezoneArt()}

✅ Bot timezone has been updated.  
📌 New timezone: *${newTimezone}*  
⚡ Active until changed again.

${getTimezoneArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing settimezone command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running settimezone command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getTimezoneArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌍─────────────────🌍",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
