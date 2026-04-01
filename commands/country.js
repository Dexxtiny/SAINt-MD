import logger from "../utils/logger.js";

export default {
    name: "country",
    description: "Generate categorized country info messages (Overview, Population, Capital, Region)",
    category: "information",

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
                        text: `🌐 *COUNTRY COMMAND*\n\nUsage:\n• country [name]\n• Reply to any message with: country\n\nExamples:\n• country Nigeria\n• country Brazil\n• country Japan`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized country info
            const results = await generateCountry(country);

            const response = `
${getCountryArt()}
🌐 *COUNTRY DATA*
${getCountryArt()}

📝 *Country:* ${country}

💡 *Overview:*  
${results.overview}

💡 *Population:*  
${results.population}

💡 *Capital:*  
${results.capital}

💡 *Region:*  
${results.region}

${getCountryArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing country command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating country message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized country info generator
async function generateCountry(country) {
    try {
        const overview = `📖 ${country} is a recognized nation with unique culture and history.`;
        const population = `📊 The population of ${country} is estimated in millions.`;
        const capital = `🏛️ The capital city of ${country} is well known globally.`;
        const region = `🌍 ${country} is located within its continental region.`;

        return { overview, population, capital, region };
    } catch (error) {
        logger.error("Error generating country info:", error);
        return { overview: "Unable to generate.", population: "Unable to generate.", capital: "Unable to generate.", region: "Unable to generate." };
    }
}

// Decorative art for country messages
function getCountryArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌐─────────────────🌐",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🏛️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
