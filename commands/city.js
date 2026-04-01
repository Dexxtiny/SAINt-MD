import logger from "../utils/logger.js";

export default {
    name: "city",
    description: "Generate categorized city facts info messages (Country, Population, Attractions, Status)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const city = args.join(" ") || quotedText || "Unknown City";

            if (!city) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🏙️ *CITY COMMAND*\n\nUsage:\n• city [name]\n• Reply to any message with: city\n\nExamples:\n• city Lagos\n• city Tokyo\n• city Paris`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized city info
            const results = await generateCity(city);

            const response = `
${getCityArt()}
🏙️ *CITY FACTS REPORT*
${getCityArt()}

📝 *City:* ${city}

💡 *Country:*  
${results.country}

💡 *Population:*  
${results.population}

💡 *Attractions:*  
${results.attractions}

💡 *Status:*  
${results.status}

${getCityArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing city command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating city message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized city facts generator
async function generateCity(city) {
    try {
        const country = `🌍 ${city} belongs to a notable country.`;
        const population = `👥 ${city} has millions of residents.`;
        const attractions = `✨ ${city} is known for cultural and historical landmarks.`;
        const status = `📊 ${city} is a major hub in its region.`;

        return { country, population, attractions, status };
    } catch (error) {
        logger.error("Error generating city info:", error);
        return { country: "Unable to generate.", population: "Unable to generate.", attractions: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for city messages
function getCityArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🏙️─────────────────🏙️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌍 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
