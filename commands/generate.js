import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "generate",
    description: "Generate creative text based on a prompt",
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
                        text: `✨ *GENERATE COMMAND*\n\nUsage:\n• generate [prompt]\n• Reply to any message with: generate\n\nExamples:\n• generate Write a short story about friendship\n• generate Create a motivational quote\n• generate Compose a poem about the ocean`,
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
                        text: "❌ No prompt provided. Please type a request or reply to a message with: generate",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Call AI generator
            const result = await generateContent(prompt);

            if (!result) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate content. Please try again later.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getGenerateArt()}
✨ *GENERATED CONTENT*
${getGenerateArt()}

📝 *Prompt:*  
${prompt}

💡 *Result:*  
${result}

${getGenerateArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing generate command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating content. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Function to call OpenAI API for generation
async function generateContent(prompt) {
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
                    { role: "system", content: "You are a creative assistant that generates engaging text." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 400,
                temperature: 0.8,
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
        logger.error("Error calling OpenAI API for generate command:", error);
        return null;
    }
}

// Decorative art for generate messages
function getGenerateArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "✨─────────────────✨",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
