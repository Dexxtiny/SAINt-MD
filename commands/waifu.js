import logger from "../utils/logger.js";

export default {
    name: "waifu",
    description: "Generate styled waifu info messages",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Waifu";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `💖 *WAIFU COMMAND*\n\nUsage:\n• waifu [theme]\n• Reply to any message with: waifu\n\nExamples:\n• waifu tsundere\n• waifu cyberpunk\n• waifu fantasy`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateWaifu(theme);

            const response = `
${getWaifuArt()}
💖 *WAIFU REPORT*
${getWaifuArt()}

📝 *Theme:* ${theme}

💡 *Appearance:*  
${results.appearance}

💡 *Personality:*  
${results.personality}

💡 *Vibe:*  
${results.vibe}

💡 *Status:*  
${results.status}

${getWaifuArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing waifu command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating waifu message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateWaifu(theme) {
    try {
        const appearance = `🎨 "${theme}" waifu has a stunning anime look.`;
        const personality = `💫 "${theme}" waifu is charming and unforgettable.`;
        const vibe = `✨ "${theme}" waifu radiates emotional depth.`;
        const status = `📊 "${theme}" waifu is adored in anime culture.`;

        return { appearance, personality, vibe, status };
    } catch (error) {
        logger.error("Error generating waifu info:", error);
        return { appearance: "Unable to generate.", personality: "Unable to generate.", vibe: "Unable to generate.", status: "Unable to generate." };
    }
}

function getWaifuArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💖─────────────────💖",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
