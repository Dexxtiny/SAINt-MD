import logger from "../utils/logger.js";

export default {
    name: "bizplan",
    description: "Generate a simple business plan outline",
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
                        text: `📈 *BIZPLAN COMMAND*\n\nUsage:\n• bizplan [business idea]\n• Reply to any message with: bizplan\n\nExamples:\n• bizplan Online clothing store\n• bizplan Mobile app for food delivery\n• bizplan Eco-friendly cleaning products`,
                    },
                    { quoted: message }
                );
                return;
            }

            const idea = args.join(" ") || quotedText;

            if (!idea) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No business idea provided. Please add some details or reply to a message with: bizplan",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate business plan outline
            const result = await generateBizPlan(idea);

            const response = `
${getBizArt()}
📈 *BUSINESS PLAN OUTLINE*
${getBizArt()}

💡 *Business Idea:* ${idea}

1️⃣ *Executive Summary*  
${result.summary}

2️⃣ *Target Market*  
${result.market}

3️⃣ *Products/Services*  
${result.products}

4️⃣ *Marketing Strategy*  
${result.marketing}

5️⃣ *Financial Plan*  
${result.financial}

${getBizArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing bizplan command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating business plan. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple business plan generator
async function generateBizPlan(idea) {
    try {
        return {
            summary: `A clear vision to build ${idea} with sustainable growth.`,
            market: `Targeting young professionals, students, and online consumers.`,
            products: `Offering innovative solutions tailored to ${idea}.`,
            marketing: `Social media campaigns, influencer partnerships, and word-of-mouth.`,
            financial: `Low startup costs, scalable revenue model, and long-term profitability.`,
        };
    } catch (error) {
        logger.error("Error generating business plan:", error);
        return {
            summary: "Unable to generate summary.",
            market: "Unable to generate market info.",
            products: "Unable to generate products info.",
            marketing: "Unable to generate marketing info.",
            financial: "Unable to generate financial info.",
        };
    }
}

// Decorative art for bizplan messages
function getBizArt() {
    const arts = [
        "📈·───────────────·💼",
        "✦━━━━━━━━━━━━━━━━━✦",
        "💡─────────────────💡",
        "⊱──────── 📊 ────────⊰",
        "»»────── 🚀 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
