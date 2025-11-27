import axios from "axios";

export default {
    name: "lyrics",
    description: "Get song lyrics",
    category: "music",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🎵 *LYRICS FINDER*\n\nUsage: lyrics [song name or artist]\n\nExamples:\n• lyrics shape of you\n• lyrics ed sheeran perfect\n• lyrics asake remember",
                    },
                    { quoted: message }
                );
                return;
            }

            const query = args.join(" ");
            
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Try Genius API first
            const response = await axios.get(
                `https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`,
                {
                    timeout: 15000
                }
            );

            const lyricsData = response.data;
            
            if (!lyricsData.lyrics) {
                throw new Error('No lyrics found');
            }

            // Truncate lyrics if too long for WhatsApp
            const truncatedLyrics = lyricsData.lyrics.length > 3500 
                ? lyricsData.lyrics.substring(0, 3500) + "...\n\n📖 *Lyrics were truncated due to length*" 
                : lyricsData.lyrics;

            const lyricsMessage = `
🎵 *${lyricsData.title || query.toUpperCase()}*

👤 *Artist:* ${lyricsData.author || 'Unknown'}

${truncatedLyrics}

🔗 _Powered by Genius API_
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: lyricsMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing lyrics command:', error);
            
            // Fallback to another API
            try {
                const fallbackResponse = await axios.get(
                    `https://api.lyrics.ovh/v1/${encodeURIComponent(args[0])}/${encodeURIComponent(args.slice(1).join(' '))}`,
                    {
                        timeout: 10000
                    }
                );

                const fallbackLyrics = fallbackResponse.data.lyrics;
                const truncated = fallbackLyrics.length > 3500 
                    ? fallbackLyrics.substring(0, 3500) + "...\n\n📖 *Lyrics were truncated*" 
                    : fallbackLyrics;

                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎵 *${args.slice(1).join(' ').toUpperCase()}*\n\n👤 *Artist:* ${args[0]}\n\n${truncated}\n\n🔗 _Powered by Lyrics.ovh_`,
                    },
                    { quoted: message }
                );

            } catch (fallbackError) {
                console.error('Fallback lyrics API also failed:', fallbackError);
                
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `❌ Could not find lyrics for: "${args.join(' ')}"\n\nTry being more specific with song and artist name.`,
                    },
                    { quoted: message }
                );
            }
        }
    },
};