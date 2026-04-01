import logger from "../utils/logger.js";

export default {
    name: "population",
    description: "Generate categorized population info messages (Current, Growth, Projection)",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const place = args.join(" ") || quotedText || "World";

            if (!place) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌍 *POPULATION COMMAND*\n\nUsage:\n• population [place]\n• Reply to any message with: population\n\nExamples:\n• population Nigeria\n• population Lagos\n• population World`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized population messages
            const results = await generatePopulation(place);

            const response = `
${getPopulationArt()}
🌍 *POPULATION DATA*
${getPopulationArt()}

📝 *Place:* ${place}

💡 *Current Estimate:*  
${results.current}

💡 *Growth Trend:*  
${results.growth}

💡 *Projection:*  
${results.projection}

${getPopulationArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing population command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating population message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized population message generator
async function generatePopulation(place) {
    try {
        const current = `📊 The population of ${place} is estimated at millions today.`;
        const growth = `📈 ${place} shows steady growth with rising urbanization.`;
        const projection = `🔮 By 2050, ${place} is projected to expand significantly.`;

        return { current, growth, projection };
    } catch (error) {
        logger.error("Error generating population message:", error);
        return { current: "Unable to generate.", growth: "Unable to generate.", projection: "Unable to generate." };
    }
}

// Decorative art for population messages
function getPopulationArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌍─────────────────🌍",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📊 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
