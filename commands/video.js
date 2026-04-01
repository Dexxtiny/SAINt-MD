import logger from "../utils/logger.js";

export default {
    name: "video",
    description: "Generate categorized video-style drop messages (Trending, Funny, Inspirational)",
    category: "media",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const clip = args.join(" ") || quotedText || "New Video";

            if (!clip) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎥 *VIDEO COMMAND*\n\nUsage:\n• video [title]\n• Reply to any message with: video\n\nExamples:\n• video Travel Vlog\n• video Dance Clip\n• video Cinematic Reel`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized video messages
            const results = await generateVideo(clip);

            const response = `
${getVideoArt()}
🎥 *VIDEO DROP*
${getVideoArt()}

📝 *Clip:* ${clip}

💡 *Trending:*  
${results.trending}

💡 *Funny:*  
${results.funny}

💡 *Inspirational:*  
${results.inspirational}

${getVideoArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing video command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating video message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized video message generator
async function generateVideo(clip) {
    try {
        const trending = `🔥 ${clip} — trending reel, share it now.`;
        const funny = `😂 ${clip} — hilarious clip, guaranteed laughs.`;
        const inspirational = `✨ ${clip} — cinematic vibe, motivation unlocked.`;

        return { trending, funny, inspirational };
    } catch (error) {
        logger.error("Error generating video message:", error);
        return { trending: "Unable to generate.", funny: "Unable to generate.", inspirational: "Unable to generate." };
    }
}

// Decorative art for video messages
function getVideoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎥─────────────────🎥",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎬 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
