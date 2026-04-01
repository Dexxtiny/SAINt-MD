import logger from "../utils/logger.js";

export default {
    name: "tiktokaudio",
    description: "Generate categorized TikTok-style audio drops (Trending, Funny, Inspirational)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const audioName = args.join(" ") || quotedText || "New TikTok Audio";

            if (!audioName) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎧 *TIKTOKAUDIO COMMAND*\n\nUsage:\n• tiktokaudio [audio name]\n• Reply to any message with: tiktokaudio\n\nExamples:\n• tiktokaudio Viral Sound\n• tiktokaudio Dance Beat\n• tiktokaudio Funny Voiceover`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized TikTok audio messages
            const results = await generateTikTokAudio(audioName);

            const response = `
${getTikTokAudioArt()}
🎧 *TIKTOK AUDIO DROP*
${getTikTokAudioArt()}

📝 *Audio:* ${audioName}

💡 *Trending:*  
${results.trending}

💡 *Funny:*  
${results.funny}

💡 *Inspirational:*  
${results.inspirational}

${getTikTokAudioArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tiktokaudio command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating TikTok audio message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized TikTok audio generator
async function generateTikTokAudio(audioName) {
    try {
        const trending = `🔥 ${audioName} — trending sound, use it before it fades.`;
        const funny = `😂 ${audioName} — hilarious audio, perfect for comedy skits.`;
        const inspirational = `✨ ${audioName} — uplifting vibe, motivation in seconds.`;

        return { trending, funny, inspirational };
    } catch (error) {
        logger.error("Error generating TikTok audio message:", error);
        return { trending: "Unable to generate.", funny: "Unable to generate.", inspirational: "Unable to generate." };
    }
}

// Decorative art for TikTok audio messages
function getTikTokAudioArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎧─────────────────🎧",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
