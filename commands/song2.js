import logger from "../utils/logger.js";

export default {
    name: "song",
    description: "Generate categorized song-style messages (Now Playing, New Release, Playlist Vibe)",
    category: "entertainment",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const track = args.join(" ") || quotedText || "New Song";

            if (!track) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎤 *SONG COMMAND*\n\nUsage:\n• song [title]\n• Reply to any message with: song\n\nExamples:\n• song Midnight Dreams\n• song Summer Anthem\n• song Chill Beats`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized song messages
            const results = await generateSong(track);

            const response = `
${getSongArt()}
🎤 *SONG DROP*
${getSongArt()}

📝 *Track:* ${track}

💡 *Now Playing:*  
${results.nowPlaying}

💡 *New Release:*  
${results.newRelease}

💡 *Playlist Vibe:*  
${results.playlistVibe}

${getSongArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing song command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating song message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized song message generator
async function generateSong(track) {
    try {
        const nowPlaying = `🎶 Now playing: ${track} — let the rhythm take over.`;
        const newRelease = `🔥 Fresh drop: ${track} — add it to your playlist today.`;
        const playlistVibe = `✨ ${track} — perfect vibe for your curated playlist.`;

        return { nowPlaying, newRelease, playlistVibe };
    } catch (error) {
        logger.error("Error generating song message:", error);
        return { nowPlaying: "Unable to generate.", newRelease: "Unable to generate.", playlistVibe: "Unable to generate." };
    }
}

// Decorative art for song messages
function getSongArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎤─────────────────🎤",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
