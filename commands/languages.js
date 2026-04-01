import logger from "../utils/logger.js";

export default {
    name: "languages",
    description: "Generate categorized language info messages (Official, Regional, Popular)",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const place = args.join(" ") || quotedText || "Unknown Place";

            if (!place) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🗣️ *LANGUAGES COMMAND*\n\nUsage:\n• languages [country/place]\n• Reply to any message with: languages\n\nExamples:\n• languages Nigeria\n• languages India\n• languages Canada`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized language info
            const results = await generateLanguages(place);

            const response = `
${getLanguagesArt()}
🗣️ *LANGUAGES DATA*
${getLanguagesArt()}

📝 *Place:* ${place}

💡 *Official:*  
${results.official}

💡 *Regional:*  
${results.regional}

💡 *Popular:*  
${results.popular}

${getLanguagesArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing languages command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating languages message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized language info generator
async function generateLanguages(place) {
    try {
        const official = `📖 The official language(s) of ${place} are recognized by law.`;
        const regional = `🌍 ${place} has diverse regional languages spoken locally.`;
        const popular = `💬 The most widely spoken language(s) in ${place} dominate everyday life.`;

        return { official, regional, popular };
    } catch (error) {
        logger.error("Error generating languages info:", error);
        return { official: "Unable to generate.", regional: "Unable to generate.", popular: "Unable to generate." };
    }
}

// Decorative art for languages messages
function getLanguagesArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🗣️─────────────────🗣️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📖 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
