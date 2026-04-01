import logger from "../utils/logger.js";

export default {
    name: "8ball",
    description: "Ask the magic 8-ball a question",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const question = args.join(" ") || quotedText || "Unknown question";

            if (!question) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎱 *8BALL COMMAND*\n\nUsage:\n• 8ball [your question]\n• Reply to any message with: 8ball\n\nExamples:\n• 8ball will I pass?\n• 8ball is today lucky?\n• 8ball should I code tonight?`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const response = get8BallResponse();

            const reply = `
✦━━━━━━━━━━━━━━━━━✦
🎱 *MAGIC 8-BALL*
✦━━━━━━━━━━━━━━━━━✦

📝 *Question:* ${question}

💬 *Answer:* ${response}

✦━━━━━━━━━━━━━━━━━✦
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: reply },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing 8ball command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating 8-ball response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function get8BallResponse() {
    const responses = [
        "Yes, definitely.",
        "Without a doubt.",
        "You may rely on it.",
        "Most likely.",
        "Outlook good.",
        "Signs point to yes.",
        "Reply hazy, try again.",
        "Ask again later.",
        "Better not tell you now.",
        "Cannot predict now.",
        "Don't count on it.",
        "My reply is no.",
        "Outlook not so good.",
        "Very doubtful.",
        "Absolutely not.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}
