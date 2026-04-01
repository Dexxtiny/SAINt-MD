import logger from "../utils/logger.js";

export default {
    name: "sportifydl",
    description: "Generate categorized Spotify-style download links (Direct, Shortened, Custom)",
    category: "entertainment",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const track = args.join(" ") || quotedText || "New Track";

            if (!track) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎧 *SPORTIFYDL COMMAND*\n\nUsage:\n• sportifydl [track/playlist]\n• Reply to any message with: sportifydl\n\nExamples:\n• sportifydl Midnight Dreams\n• sportifydl Summer Playlist\n• sportifydl Chill Beats`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Spotify download links
            const results = await generateSpotifyDL(track);

            const response = `
${getSpotifyArt()}
🎧 *SPOTIFY DOWNLOAD*
${getSpotifyArt()}

📝 *Track:* ${track}

💡 *Direct:*  
${results.direct}

💡 *Shortened:*  
${results.shortened}

💡 *Custom:*  
${results.custom}

${getSpotifyArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing sportifydl command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Spotify download link. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Spotify download link generator
async function generateSpotifyDL(track) {
    try {
        const safeTrack = track.replace(/\s+/g, "_");
        const direct = `https://open.spotify.com/track/${safeTrack}`;
        const shortened = `https://spoti.fi/${safeTrack}`;
        const custom = `https://spotifydl.com/custom/${safeTrack}`;

        return { direct, shortened, custom };
    } catch (error) {
        logger.error("Error generating SpotifyDL link:", error);
        return { direct: "Unable to generate.", shortened: "Unable to generate.", custom: "Unable to generate." };
    }
}

// Decorative art for Spotify messages
function getSpotifyArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎧─────────────────🎧",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎶 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
