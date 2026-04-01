import logger from "../utils/logger.js";

export default {
    name: "slogan",
    description: "Generate categorized slogans (Inspirational, Funny, Professional)",
    category: "creative",

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
                        text: `✨ *SLOGAN COMMAND*\n\nUsage:\n• slogan [product/brand/theme]\n• Reply to any message with: slogan\n\nExamples:\n• slogan Coffee Shop\n• slogan Tech Startup\n• slogan Fitness Brand`,
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
                        text: "❌ No theme provided. Please type a product/brand/theme or reply to a message with: slogan",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized slogans
            const results = await generateSlogans(theme);

            const response = `
${getSloganArt()}
✨ *SLOGAN GENERATOR*
${getSloganArt()}

📝 *Theme:* ${theme}

💡 *Inspirational:*  
${results.inspirational}

💡 *Funny:*  
${results.funny}

💡 *Professional:*  
${results.professional}

${getSloganArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing slogan command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating slogans. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized slogan generator
async function generateSlogans(theme) {
    try {
        const inspirational = `${theme}: Empowering dreams, inspiring change.`;
        const funny = `${theme} — because life’s too short for boring choices.`;
        const professional = `${theme}: Excellence you can trust, results you can measure.`;

        return { inspirational, funny, professional };
    } catch (error) {
        logger.error("Error generating slogans:", error);
        return { inspirational: "Unable to generate.", funny: "Unable to generate.", professional: "Unable to generate." };
    }
}

// Decorative art for slogan messages
function getSloganArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "✨─────────────────✨",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
