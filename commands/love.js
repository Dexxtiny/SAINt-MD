import logger from "../utils/logger.js";

export default {
    name: "love",
    description: "Generate styled love messages",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Love";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `❤️ *LOVE COMMAND*\n\nUsage:\n• love [theme]\n• Reply to any message with: love\n\nExamples:\n• love forever\n• love friendship\n• love destiny`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateLove(theme);

            const response = `
${getLoveArt()}
❤️ *LOVE REPORT*
${getLoveArt()}

📝 *Theme:* ${theme}

💡 *Message:*  
${results.message}

💡 *Emotion:*  
${results.emotion}

💡 *Vibe:*  
${results.vibe}

💡 *Status:*  
${results.status}

${getLoveArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing love command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating love message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateLove(theme) {
    try {
        const message = `💖 "${theme}" love: a bond that grows stronger each day.`;
        const emotion = `💕 "${theme}" emotion: warmth, passion, and tenderness.`;
        const vibe = `✨ "${theme}" vibe: romantic and uplifting.`;
        const status = `📊 "${theme}" love is timeless and cherished.`;

        return { message, emotion, vibe, status };
    } catch (error) {
        logger.error("Error generating love info:", error);
        return { message: "Unable to generate.", emotion: "Unable to generate.", vibe: "Unable to generate.", status: "Unable to generate." };
    }
}

function getLoveArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "❤️─────────────────❤️",
        "⊱──────── 💕 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
