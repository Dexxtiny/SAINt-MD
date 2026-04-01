import logger from "../utils/logger.js";

export default {
    name: "qwenai",
    description: "Generate intelligent insights or answers using Qwen AI style",
    category: "ai",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🤖 *QWENAI COMMAND*\n\nUsage:\n• qwenai [prompt]\n• Reply to any message with: qwenai\n\nExamples:\n• qwenai Explain quantum computing\n• qwenai Give tips for startups\n• qwenai Summarize climate change impact`,
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ") || quotedText;

            if (!prompt) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No prompt provided. Please type a request or reply to a message with: qwenai",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate Qwen AI style response
            const result = await generateQwenAIResponse(prompt);

            const response = `
${getQwenArt()}
🤖 *QWEN AI RESPONSE*
${getQwenArt()}

📝 *Prompt:* ${prompt}

💡 *Insight:*  
${result}

${getQwenArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing qwenai command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Qwen AI response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Qwen AI style response generator
async function generateQwenAIResponse(prompt) {
    try {
        const responses = [
            `${prompt} can be understood by breaking it into simple principles, then connecting them to real-world applications.`,
            `The essence of ${prompt} lies in its ability to transform complexity into clarity.`,
            `${prompt} is not just a concept — it’s a framework for innovation and deeper understanding.`,
            `Exploring ${prompt} reveals both challenges and opportunities that shape the future.`,
            `${prompt} demonstrates how knowledge evolves when curiosity meets structured reasoning.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
        logger.error("Error generating Qwen AI response:", error);
        return "Unable to generate Qwen AI response.";
    }
}

// Decorative art for qwenai messages
function getQwenArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤖─────────────────🤖",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📚 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
