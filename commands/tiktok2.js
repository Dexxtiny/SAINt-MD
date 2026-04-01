import logger from "../utils/logger.js";

export default {
    name: "tiktok",
    description: "Generate categorized TikTok-style captions (Trendy, Funny, Inspirational)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const topic = args.join(" ") || quotedText || "New TikTok";

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎬 *TIKTOK COMMAND*\n\nUsage:\n• tiktok [topic]\n• Reply to any message with: tiktok\n\nExamples:\n• tiktok Dance Challenge\n• tiktok Comedy Skit\n• tiktok Travel Vlog`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized TikTok captions
            const results = await generateTikTok(topic);

            const response = `
${getTikTokArt()}
🎬 *TIKTOK DROP*
${getTikTokArt()}

📝 *Topic:* ${topic}

💡 *Trendy:*  
${results.trendy}

💡 *Funny:*  
${results.funny}

💡 *Inspirational:*  
${results.inspirational}

${getTikTokArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tiktok command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating TikTok caption. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized TikTok caption generator
async function generateTikTok(topic) {
    try {
        const trendy = `🔥 ${topic} — trending now, join the hype.`;
        const funny = `😂 ${topic} — laughter guaranteed, share with friends.`;
        const inspirational = `✨ ${topic} — short clip, big motivation.`;

        return { trendy, funny, inspirational };
    } catch (error) {
        logger.error("Error generating TikTok caption:", error);
        return { trendy: "Unable to generate.", funny: "Unable to generate.", inspirational: "Unable to generate." };
    }
}

// Decorative art for TikTok messages
function getTikTokArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎬─────────────────🎬",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔥 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
