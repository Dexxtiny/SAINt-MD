import logger from "../utils/logger.js";

export default {
    name: "instagram",
    description: "Generate categorized Instagram-style captions (Trendy, Minimalist, Inspirational)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const topic = args.join(" ") || quotedText || "Life Moments";

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📸 *INSTAGRAM COMMAND*\n\nUsage:\n• instagram [topic]\n• Reply to any message with: instagram\n\nExamples:\n• instagram Travel Diaries\n• instagram Foodie Life\n• instagram Weekend Vibes`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Instagram captions
            const results = await generateInstagram(topic);

            const response = `
${getInstagramArt()}
📸 *INSTAGRAM CAPTION GENERATOR*
${getInstagramArt()}

📝 *Topic:* ${topic}

💡 *Trendy:*  
${results.trendy}

💡 *Minimalist:*  
${results.minimalist}

💡 *Inspirational:*  
${results.inspirational}

${getInstagramArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing instagram command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Instagram caption. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Instagram caption generator
async function generateInstagram(topic) {
    try {
        const trendy = `🔥 ${topic} vibes — serving looks and living the moment.`;
        const minimalist = `${topic}. Pure. Simple. Beautiful.`;
        const inspirational = `✨ ${topic} reminds us that every day holds a new chance to shine.`;

        return { trendy, minimalist, inspirational };
    } catch (error) {
        logger.error("Error generating Instagram captions:", error);
        return { trendy: "Unable to generate.", minimalist: "Unable to generate.", inspirational: "Unable to generate." };
    }
}

// Decorative art for Instagram messages
function getInstagramArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📸─────────────────📸",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
