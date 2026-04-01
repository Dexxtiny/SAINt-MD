import logger from "../utils/logger.js";

export default {
    name: "fact",
    description: "Generate styled general facts",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Fact";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📘 *FACT COMMAND*\n\nUsage:\n• fact [theme]\n• Reply to any message with: fact\n\nExamples:\n• fact science\n• fact history\n• fact animals`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateFact(theme);

            const response = `
${getFactArt()}
📘 *FACT REPORT*
${getFactArt()}

📝 *Theme:* ${theme}

💡 *Fact:*  
${results.fact}

💡 *Insight:*  
${results.insight}

💡 *Trivia:*  
${results.trivia}

💡 *Status:*  
${results.status}

${getFactArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing fact command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating fact message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateFact(theme) {
    try {
        const fact = `📖 "${theme}" fact: The Eiffel Tower can grow taller in summer due to heat expansion.`;
        const insight = `🔍 "${theme}" insight: Many scientific phenomena are influenced by temperature.`;
        const trivia = `✨ "${theme}" trivia: The Eiffel Tower was originally meant to be temporary.`;
        const status = `📊 "${theme}" fact is fascinating and widely shared.`;

        return { fact, insight, trivia, status };
    } catch (error) {
        logger.error("Error generating fact info:", error);
        return { fact: "Unable to generate.", insight: "Unable to generate.", trivia: "Unable to generate.", status: "Unable to generate." };
    }
}

function getFactArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📘─────────────────📘",
        "⊱──────── 🔍 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
