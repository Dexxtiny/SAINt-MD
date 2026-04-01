import logger from "../utils/logger.js";

export default {
    name: "vision",
    description: "Generate categorized vision statements (Inspirational, Practical, Bold)",
    category: "motivational",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Vision";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌟 *VISION COMMAND*\n\nUsage:\n• vision [theme]\n• Reply to any message with: vision\n\nExamples:\n• vision Future of Education\n• vision Team Growth\n• vision Personal Success`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized vision statements
            const results = await generateVision(theme);

            const response = `
${getVisionArt()}
🌟 *VISION STATEMENTS*
${getVisionArt()}

📝 *Theme:* ${theme}

💡 *Inspirational:*  
${results.inspirational}

💡 *Practical:*  
${results.practical}

💡 *Bold:*  
${results.bold}

${getVisionArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing vision command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating vision statement. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized vision generator
async function generateVision(theme) {
    try {
        const inspirational = `Our vision for ${theme} is to inspire hope, ignite creativity, and build a brighter tomorrow.`;
        const practical = `The vision for ${theme} is a clear roadmap: measurable goals, achievable milestones, and sustainable growth.`;
        const bold = `We envision ${theme} as a revolution — daring, disruptive, and destined to reshape the future.`;

        return { inspirational, practical, bold };
    } catch (error) {
        logger.error("Error generating vision statement:", error);
        return { inspirational: "Unable to generate.", practical: "Unable to generate.", bold: "Unable to generate." };
    }
}

// Decorative art for vision messages
function getVisionArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌟─────────────────🌟",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🚀 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
