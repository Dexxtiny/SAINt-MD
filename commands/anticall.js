import logger from "../utils/logger.js";

export default {
    name: "anticall",
    description: "Enable anti-call protection to block incoming calls",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AntiCall mode in DB
            db.setConfig("antiCall", true);

            const response = `
${getCallArt()}
📵 *ANTICALL MODE ENABLED*
${getCallArt()}

✅ Incoming calls will now be blocked automatically.  
⚡ Protection active for this bot.

${getCallArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing anticall command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running anticall command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getCallArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📵─────────────────📵",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
