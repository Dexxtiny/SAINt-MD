import logger from "../utils/logger.js";

export default {
    name: "perplexity",
    description: "Generate categorized thought-provoking questions (Philosophical, Practical, Speculative)",
    category: "wisdom",

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
                        text: `🤔 *PERPLEXITY COMMAND*\n\nUsage:\n• perplexity [theme]\n• Reply to any message with: perplexity\n\nExamples:\n• perplexity Time\n• perplexity Happiness\n• perplexity Technology`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || quotedText;

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No theme provided. Please add a subject or reply to a message with: perplexity",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized questions
            const results = await generatePerplexity(theme);

            const response = `
${getPerplexityArt()}
🤔 *PERPLEXITY INSIGHTS*
${getPerplexityArt()}

📝 *Theme:* ${theme}

💡 *Philosophical:*  
${results.philosophical}

💡 *Practical:*  
${results.practical}

💡 *Speculative:*  
${results.speculative}

${getPerplexityArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing perplexity command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating perplexity insights. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized perplexity generator
async function generatePerplexity(theme) {
    try {
        const philosophical = `Is ${theme} an objective truth, or only a construct of human thought?`;
        const practical = `How can ${theme} be applied to improve everyday life?`;
        const speculative = `What might ${theme} look like in a future shaped by technology and imagination?`;

        return { philosophical, practical, speculative };
    } catch (error) {
        logger.error("Error generating perplexity insights:", error);
        return { philosophical: "Unable to generate.", practical: "Unable to generate.", speculative: "Unable to generate." };
    }
}

// Decorative art for perplexity messages
function getPerplexityArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤔─────────────────🤔",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌌 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
