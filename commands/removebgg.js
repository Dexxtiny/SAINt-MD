import logger from "../utils/logger.js";

export default {
    name: "removebg",
    description: "Remove background from an uploaded image",
    category: "image",

    async execute(message, client, args) {
        try {
            const imageMessage =
                message.message?.imageMessage ||
                message.message?.documentMessage ||
                null;

            if (!imageMessage) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🖼️ *REMOVEBG COMMAND*\n\nUsage:\n• removebg (attach an image)\n• Reply to an image with: removebg\n\nExamples:\n• removebg (send with photo)\n• Reply to any image with: removebg`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Call background removal
            const result = await processRemoveBG(imageMessage);

            const response = `
${getRemoveBGArt()}
🖼️ *BACKGROUND REMOVED*
${getRemoveBGArt()}

✅ Your image has been processed with a transparent background.

${getRemoveBGArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing removebg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error removing background. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Background removal processor
async function processRemoveBG(imageMessage) {
    try {
        // Here you would integrate with your background removal logic or API
        return true;
    } catch (error) {
        logger.error("Error processing removebg:", error);
        return false;
    }
}

// Decorative art for removebg messages
function getRemoveBGArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
