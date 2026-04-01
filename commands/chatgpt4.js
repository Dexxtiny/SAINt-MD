import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "chatgpt4",
    description: "Ask GPT-4 any question or request",
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
                        text: `🤖 *CHATGPT-4 COMMAND*\n\nUsage:\n• chatgpt4 [prompt]\n• Reply to any message with: chatgpt4\n\nExamples:\n• chatgpt4 Write a poem about Lagos\n• chatgpt4 Explain quantum computing simply\n• chatgpt4 Summarize this text (reply to a message)`,
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
                        text: "❌ No prompt provided. Please type a question or reply to a message with: chatgpt4",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Call GPT-4
            const result = await askGPT4(prompt);

            if (!result) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate a response. Please try again later.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getGPTArt()}
🤖 *CHATGPT-4 RESPONSE*
${getGPTArt()}

📝 *Prompt:*  
${prompt}

💡 *Answer:*  
${result}

${getGPTArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing chatgpt4 command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Function to call GPT-4 API
async function askGPT4(prompt) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 20000,
            }
        );

        return response.data.choices?.[0]?.message?.content?.trim() || null;
    } catch (error) {
        logger.error("Error calling GPT-4 API:", error);
        return null;
    }
}

// Decorative art for GPT-4 messages
function getGPTArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🤖─────────────────🤖",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
