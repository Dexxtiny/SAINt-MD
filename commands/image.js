import logger from "../utils/logger.js";

export default {
    name: "image",
    description: "Generate categorized image prompts (Surreal, Minimalist, Futuristic)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const subject = args.join(" ") || quotedText || "Abstract Art";

            if (!subject) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🖼️ *IMAGE COMMAND*\n\nUsage:\n• image [subject]\n• Reply to any message with: image\n\nExamples:\n• image Sunset over Venice\n• image Futuristic City\n• image Minimalist Logo`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized image prompts
            const results = await generateImagePrompt(subject);

            const response = `
${getImageArt()}
🖼️ *IMAGE PROMPT GENERATOR*
${getImageArt()}

📝 *Subject:* ${subject}

💡 *Surreal:*  
${results.surreal}

💡 *Minimalist:*  
${results.minimalist}

💡 *Futuristic:*  
${results.futuristic}

${getImageArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing image command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating image prompt. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized image prompt generator
async function generateImagePrompt(subject) {
    try {
        const surreal = `A surreal illustration of ${subject}, glowing with dreamlike colors and impossible shapes.`;
        const minimalist = `Minimalist design of ${subject}, clean lines, soft tones, and elegant simplicity.`;
        const futuristic = `Futuristic concept art of ${subject}, blending neon lights, advanced tech, and bold imagination.`;

        return { surreal, minimalist, futuristic };
    } catch (error) {
        logger.error("Error generating image prompt:", error);
        return { surreal: "Unable to generate.", minimalist: "Unable to generate.", futuristic: "Unable to generate." };
    }
}

// Decorative art for image messages
function getImageArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎨 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
