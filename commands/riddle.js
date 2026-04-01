import logger from "../utils/logger.js";

export default {
    name: "riddle",
    description: "Generate styled riddles with hints and answers",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Riddle";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🧩 *RIDDLE COMMAND*\n\nUsage:\n• riddle [theme]\n• Reply to any message with: riddle\n\nExamples:\n• riddle logic\n• riddle animal\n• riddle mystery`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateRiddle(theme);

            const response = `
${getRiddleArt()}
🧩 *RIDDLE REPORT*
${getRiddleArt()}

📝 *Theme:* ${theme}

💡 *Riddle:*  
${results.riddle}

💡 *Hint:*  
${results.hint}

💡 *Answer:*  
${results.answer}

💡 *Status:*  
${results.status}

${getRiddleArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing riddle command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating riddle message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateRiddle(theme) {
    try {
        const riddle = `❓ "${theme}" riddle: What has keys but can't open locks?`;
        const hint = `🔑 "${theme}" hint: It's something you use daily.`;
        const answer = `✅ "${theme}" answer: A keyboard.`;
        const status = `📊 "${theme}" riddle is classic and fun.`;

        return { riddle, hint, answer, status };
    } catch (error) {
        logger.error("Error generating riddle info:", error);
        return { riddle: "Unable to generate.", hint: "Unable to generate.", answer: "Unable to generate.", status: "Unable to generate." };
    }
}

function getRiddleArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧩─────────────────🧩",
        "⊱──────── ❓ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
