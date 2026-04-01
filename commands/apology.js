import logger from "../utils/logger.js";

export default {
    name: "apology",
    description: "Send a polite apology message",
    category: "tools",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🙏 *APOLOGY COMMAND*\n\nUsage:\n• apology [reason]\n• Reply to any message with: apology [reason]\n\nExamples:\n• apology for being late\n• apology I missed your call\n• apology misunderstanding earlier`,
                    },
                    { quoted: message }
                );
                return;
            }

            const reason = args.join(" ") || quotedText || "any inconvenience";

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const response = `
${getApologyArt()}
🙏 *APOLOGY MESSAGE*
${getApologyArt()}

Dear friend,

I sincerely apologize for ${reason}.
Please forgive me, and know it wasn’t my intention.

${getApologyArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing apology command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error sending apology. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Decorative art for apology messages
function getApologyArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🙏─────────────────🙏",
        "⊱──────── 💬 ────────⊰",
        "»»────── 🤝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
