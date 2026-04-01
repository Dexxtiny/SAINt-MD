import logger from "../utils/logger.js";

export default {
    name: "lyrics",
    description: "Generate categorized lyric messages (Classic, Modern, Poetic)",
    category: "entertainment",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const lyricLine = args.join(" ") || quotedText || "Sing your heart out";

            if (!lyricLine) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎵 *LYRICS COMMAND*\n\nUsage:\n• lyrics [line]\n• Reply to any message with: lyrics\n\nExamples:\n• lyrics Hello from the other side\n• lyrics We will rock you\n• lyrics Imagine all the people`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized lyric styles
            const results = await generateLyrics(lyricLine);

            const response = `
${getLyricsArt()}
🎵 *LYRICS DROP*
${getLyricsArt()}

📝 *Line:* ${lyricLine}

💡 *Classic Style:*  
${results.classic}

💡 *Modern Style:*  
${results.modern}

💡 *Poetic Style:*  
${results.poetic}

${getLyricsArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing lyrics command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating lyrics message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized lyric generator
async function generateLyrics(line) {
    try {
        const classic = `🎶 "${line}" — timeless and unforgettable.`;
        const modern = `🔥 "${line}" — trending vibes of today.`;
        const poetic = `🌹 "${line}" — flowing like poetry in motion.`;

        return { classic, modern, poetic };
    } catch (error) {
        logger.error("Error generating lyrics:", error);
        return { classic: "Unable to generate.", modern: "Unable to generate.", poetic: "Unable to generate." };
    }
}

// Decorative art for lyrics messages
function getLyricsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎵─────────────────🎵",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
