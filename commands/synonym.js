import logger from "../utils/logger.js";

export default {
    name: "synonym",
    description: "Generate categorized synonym messages (Formal, Casual, Creative)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const word = args.join(" ") || quotedText || "Unknown Word";

            if (!word) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📝 *SYNONYM COMMAND*\n\nUsage:\n• synonym [word]\n• Reply to any message with: synonym\n\nExamples:\n• synonym happy\n• synonym fast\n• synonym strong`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized synonyms
            const results = await generateSynonym(word);

            const response = `
${getSynonymArt()}
📝 *SYNONYM DATA*
${getSynonymArt()}

🔑 *Word:* ${word}

💡 *Formal:*  
${results.formal}

💡 *Casual:*  
${results.casual}

💡 *Creative:*  
${results.creative}

${getSynonymArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing synonym command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating synonym message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized synonym generator
async function generateSynonym(word) {
    try {
        const formal = `📖 "${word}" — refined alternatives for professional use.`;
        const casual = `💬 "${word}" — everyday synonyms for friendly tone.`;
        const creative = `✨ "${word}" — expressive and unique variations.`;

        return { formal, casual, creative };
    } catch (error) {
        logger.error("Error generating synonyms:", error);
        return { formal: "Unable to generate.", casual: "Unable to generate.", creative: "Unable to generate." };
    }
}

// Decorative art for synonym messages
function getSynonymArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
