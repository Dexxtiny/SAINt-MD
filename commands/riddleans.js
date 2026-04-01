import logger from "../utils/logger.js";

export default {
    name: "riddleans",
    description: "Provide styled riddle answers",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const riddle = args.join(" ") || quotedText || "Unknown Riddle";

            if (!riddle) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🧩 *RIDDLEANS COMMAND*\n\nUsage:\n• riddleans [riddle]\n• Reply to any message with: riddleans\n\nExamples:\n• riddleans What has keys but can't open locks?\n• riddleans The more you take, the more you leave behind.`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateRiddleAnswer(riddle);

            const response = `
${getRiddleAnsArt()}
🧩 *RIDDLE ANSWER REPORT*
${getRiddleAnsArt()}

📝 *Riddle:* ${riddle}

💡 *Answer:*  
${results.answer}

💡 *Explanation:*  
${results.explanation}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getRiddleAnsArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing riddleans command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating riddle answer. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateRiddleAnswer(riddle) {
    try {
        const answer = `✅ The answer is: A keyboard.`;
        const explanation = `🔑 Because it has keys but cannot open locks.`;
        const mood = `✨ Clever and satisfying.`;
        const status = `📊 Classic riddle answer, widely known.`;

        return { answer, explanation, mood, status };
    } catch (error) {
        logger.error("Error generating riddle answer info:", error);
        return { answer: "Unable to generate.", explanation: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

function getRiddleAnsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧩─────────────────🧩",
        "⊱──────── ✅ ────────⊰",
        "»»────── 🔑 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
