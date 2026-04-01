import logger from "../utils/logger.js";

export default {
    name: "tweetgen",
    description: "Generate categorized tweets (Inspirational, Funny, Business)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const topic = args.join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🐦 *TWEETGEN COMMAND*\n\nUsage:\n• tweetgen [topic]\n• Reply to any message with: tweetgen\n\nExamples:\n• tweetgen AI in Education\n• tweetgen Healthy Lifestyle\n• tweetgen Startup Motivation`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized tweets
            const results = await generateTweets(topic);

            const response = `
${getTweetArt()}
🐦 *TWEET GENERATOR*
${getTweetArt()}

📝 *Topic:* ${topic}

💡 *Inspirational:*  
${results.inspirational}

💡 *Funny:*  
${results.funny}

💡 *Business:*  
${results.business}

${getTweetArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tweetgen command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating tweets. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized tweet generator
async function generateTweets(topic) {
    try {
        const inspirational = `The future belongs to those who embrace ${topic}. Dream big, act bold, and inspire change.`;
        const funny = `They said ${topic} was complicated… so I Googled it. Still complicated. 😂`;
        const business = `${topic} is more than a trend — it’s a strategy. Smart leaders are already leveraging it for growth.`;

        return { inspirational, funny, business };
    } catch (error) {
        logger.error("Error generating tweets:", error);
        return { inspirational: "Unable to generate.", funny: "Unable to generate.", business: "Unable to generate." };
    }
}

// Decorative art for tweet messages
function getTweetArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐦─────────────────🐦",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
