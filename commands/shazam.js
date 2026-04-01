import logger from "../utils/logger.js";

export default {
    name: "shazam",
    description: "Generate categorized music-inspired lines (Lyric-Style, Concert Fact, Playlist Vibe)",
    category: "fun",

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
                        text: `🎶 *SHAZAM COMMAND*\n\nUsage:\n• shazam [word/theme]\n• Reply to any message with: shazam\n\nExamples:\n• shazam Coffee\n• shazam Love\n• shazam Coding`,
                    },
                    { quoted: message }
                );
                return;
            }

            const theme = args.join(" ") || quotedText;

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No theme provided. Please type a word/theme or reply to a message with: shazam",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Shazam-style lines
            const results = await generateShazam(theme);

            const response = `
${getShazamArt()}
🎶 *SHAZAM MODE*
${getShazamArt()}

📝 *Theme:* ${theme}

💡 *Lyric-Style:*  
${results.lyric}

💡 *Concert Fact:*  
${results.concert}

💡 *Playlist Vibe:*  
${results.playlist}

${getShazamArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing shazam command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Shazam response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Shazam-style generator
async function generateShazam(theme) {
    try {
        const lyric = `If ${theme} were a lyric, it would echo in every chorus.`;
        const concert = `Fans would scream ${theme} louder than the headliner’s name.`;
        const playlist = `${theme} belongs on every playlist — it’s the track you never skip.`;

        return { lyric, concert, playlist };
    } catch (error) {
        logger.error("Error generating Shazam line:", error);
        return { lyric: "Unable to generate.", concert: "Unable to generate.", playlist: "Unable to generate." };
    }
}

// Decorative art for Shazam messages
function getShazamArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎶─────────────────🎶",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎤 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
