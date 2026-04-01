import logger from "../utils/logger.js";

export default {
    name: "urban",
    description: "Generate categorized urban dictionary-style messages (Definition, Usage, Tone, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const term = args.join(" ") || quotedText || "Unknown Term";

            if (!term) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📚 *URBAN COMMAND*\n\nUsage:\n• urban [word/phrase]\n• Reply to any message with: urban\n\nExamples:\n• urban lit\n• urban savage\n• urban flex`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized urban definitions
            const results = await generateUrban(term);

            const response = `
${getUrbanArt()}
📚 *URBAN DICTIONARY STYLE*
${getUrbanArt()}

📝 *Term:* ${term}

💡 *Definition:*  
${results.definition}

💡 *Usage:*  
${results.usage}

💡 *Tone:*  
${results.tone}

💡 *Status:*  
${results.status}

${getUrbanArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing urban command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating urban message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized urban definition generator
async function generateUrban(term) {
    try {
        const definition = `📖 "${term}" is a slang term with cultural meaning.`;
        const usage = `💬 Example: "Yo, that’s so ${term}!"`;
        const tone = `✨ "${term}" carries a playful or edgy vibe.`;
        const status = `📊 "${term}" is trending in urban lingo.`;

        return { definition, usage, tone, status };
    } catch (error) {
        logger.error("Error generating urban info:", error);
        return { definition: "Unable to generate.", usage: "Unable to generate.", tone: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for urban messages
function getUrbanArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📚─────────────────📚",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
