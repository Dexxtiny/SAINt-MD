import logger from "../utils/logger.js";

export default {
    name: "countryquiz",
    description: "Generate styled country quiz questions",
    category: "quiz",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Country Quiz";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌍 *COUNTRYQUIZ COMMAND*\n\nUsage:\n• countryquiz [theme]\n• Reply to any message with: countryquiz\n\nExamples:\n• countryquiz capitals\n• countryquiz flags\n• countryquiz geography`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateCountryQuiz(theme);

            const response = `
${getCountryQuizArt()}
🌍 *COUNTRY QUIZ REPORT*
${getCountryQuizArt()}

📝 *Theme:* ${theme}

💡 *Question:*  
${results.question}

💡 *Options:*  
${results.options}

💡 *Answer:*  
${results.answer}

💡 *Status:*  
${results.status}

${getCountryQuizArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing countryquiz command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating country quiz. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateCountryQuiz(theme) {
    try {
        const question = `❓ "${theme}" quiz: What is the capital of Japan?`;
        const options = `🇯🇵 A) Tokyo\nB) Kyoto\nC) Osaka\nD) Nagoya`;
        const answer = `✅ Correct answer: Tokyo.`;
        const status = `📊 "${theme}" quiz is educational and fun.`;

        return { question, options, answer, status };
    } catch (error) {
        logger.error("Error generating country quiz info:", error);
        return { question: "Unable to generate.", options: "Unable to generate.", answer: "Unable to generate.", status: "Unable to generate." };
    }
}

function getCountryQuizArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌍─────────────────🌍",
        "⊱──────── ❓ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
