import logger from "../utils/logger.js";

export default {
    name: "caption",
    description: "Generate catchy captions for posts or images",
    category: "tools",

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
                        text: `📸 *CAPTION COMMAND*\n\nUsage:\n• caption [topic]\n• Reply to any message with: caption\n\nExamples:\n• caption Sunset at the beach\n• caption New sneakers\n• caption Celebrating my birthday`,
                    },
                    { quoted: message }
                );
                return;
            }

            const topic = args.join(" ") || quotedText;

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No topic provided. Please add a subject or reply to a message with: caption",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate caption
            const result = await generateCaption(topic);

            const response = `
${getCaptionArt()}
📸 *CAPTION SUGGESTION*
${getCaptionArt()}

📝 *Topic:* ${topic}

✨ *Caption:*  
${result}

${getCaptionArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing caption command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating caption. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Simple caption generator
async function generateCaption(topic) {
    try {
        const captions = [
            `Living the moment: ${topic}`,
            `✨ ${topic} vibes only ✨`,
            `Because ${topic} deserves a spotlight`,
            `Making memories with ${topic}`,
            `When in doubt, just add ${topic}`
        ];
        return captions[Math.floor(Math.random() * captions.length)];
    } catch (error) {
        logger.error("Error generating caption:", error);
        return "Unable to generate caption.";
    }
}

// Decorative art for caption messages
function getCaptionArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📸─────────────────📸",
        "⊱──────── ✨ ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
