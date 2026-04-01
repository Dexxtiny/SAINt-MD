import logger from "../utils/logger.js";

export default {
    name: "news",
    description: "Generate styled news headline messages",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const headline = args.join(" ") || quotedText || "Breaking News";

            if (!headline) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📰 *NEWS COMMAND*\n\nUsage:\n• news [headline]\n• Reply to any message with: news\n\nExamples:\n• news Major Update Released\n• news New Feature Announcement\n• news Global Event Coverage`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized news messages
            const results = await generateNews(headline);

            const response = `
${getNewsArt()}
📰 *NEWS BULLETIN*
${getNewsArt()}

📝 *Headline:* ${headline}

💡 *Breaking:*  
${results.breaking}

💡 *Trending:*  
${results.trending}

💡 *Informative:*  
${results.informative}

${getNewsArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing news command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating news message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized news message generator
async function generateNews(headline) {
    try {
        const breaking = `🚨 BREAKING: ${headline} — just in.`;
        const trending = `🔥 TRENDING: ${headline} — making waves online.`;
        const informative = `ℹ️ UPDATE: ${headline} — details unfolding.`;

        return { breaking, trending, informative };
    } catch (error) {
        logger.error("Error generating news message:", error);
        return { breaking: "Unable to generate.", trending: "Unable to generate.", informative: "Unable to generate." };
    }
}

// Decorative art for news messages
function getNewsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📰─────────────────📰",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🚨 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
