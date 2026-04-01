import logger from "../utils/logger.js";

export default {
    name: "worldfacts",
    description: "Generate styled world facts info messages",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const country = args.join(" ") || quotedText || "Unknown Country";

            if (!country) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌍 *WORLDFACTS COMMAND*\n\nUsage:\n• worldfacts [country]\n• Reply to any message with: worldfacts\n\nExamples:\n• worldfacts Nigeria\n• worldfacts Japan\n• worldfacts Brazil`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized world facts
            const results = await generateWorldFacts(country);

            const response = `
${getWorldFactsArt()}
🌍 *WORLD FACTS REPORT*
${getWorldFactsArt()}

📝 *Country:* ${country}

💡 *Capital:*  
${results.capital}

💡 *Population:*  
${results.population}

💡 *Language:*  
${results.language}

💡 *Currency:*  
${results.currency}

${getWorldFactsArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing worldfacts command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating worldfacts message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// World facts generator (placeholder style)
async function generateWorldFacts(country) {
    try {
        const capital = `🏛️ The capital of ${country} is listed here.`;
        const population = `👥 ${country} has millions of residents.`;
        const language = `🗣️ Official languages are noted for ${country}.`;
        const currency = `💱 ${country} uses its national currency.`;

        return { capital, population, language, currency };
    } catch (error) {
        logger.error("Error generating worldfacts info:", error);
        return { capital: "Unable to generate.", population: "Unable to generate.", language: "Unable to generate.", currency: "Unable to generate." };
    }
}

// Decorative art for worldfacts messages
function getWorldFactsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌍─────────────────🌍",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🏛️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
