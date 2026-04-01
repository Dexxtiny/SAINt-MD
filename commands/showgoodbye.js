import logger from "../utils/logger.js";

export default {
    name: "showgoodbye",
    description: "Enable showing of goodbye/left messages",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Disable DelGoodbye mode in DB
            db.setConfig("delGoodbye", false);

            const response = `
${getGoodbyeArt()}
👋 *SHOWGOODBYE MODE ENABLED*
${getGoodbyeArt()}

✅ Goodbye/left group messages will now be shown normally.  
⚡ Active until changed again.

${getGoodbyeArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing showgoodbye command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running showgoodbye command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getGoodbyeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👋─────────────────👋",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
