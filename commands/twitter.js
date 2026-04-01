import logger from "../utils/logger.js";

export default {
    name: "twitter",
    description: "Generate categorized Twitter-style posts (Trendy, Funny, Inspirational)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const tweet = args.join(" ") || quotedText || "New Tweet";

            if (!tweet) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🐦 *TWITTER COMMAND*\n\nUsage:\n• twitter [message]\n• Reply to any message with: twitter\n\nExamples:\n• twitter Just dropped a new track!\n• twitter Big news coming soon...\n• twitter Stay tuned for updates.`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Twitter posts
            const results = await generateTwitter(tweet);

            const response = `
${getTwitterArt()}
🐦 *TWITTER POST*
${getTwitterArt()}

📝 *Tweet:* ${tweet}

💡 *Trendy:*  
${results.trendy}

💡 *Funny:*  
${results.funny}

💡 *Inspirational:*  
${results.inspirational}

${getTwitterArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing twitter command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Twitter message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Twitter post generator
async function generateTwitter(tweet) {
    try {
        const trendy = `🔥 ${tweet} — trending now, retweet it.`;
        const funny = `😂 ${tweet} — short, sharp, and hilarious.`;
        const inspirational = `✨ ${tweet} — words that spark motivation.`;

        return { trendy, funny, inspirational };
    } catch (error) {
        logger.error("Error generating Twitter message:", error);
        return { trendy: "Unable to generate.", funny: "Unable to generate.", inspirational: "Unable to generate." };
    }
}

// Decorative art for Twitter messages
function getTwitterArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐦─────────────────🐦",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔥 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
