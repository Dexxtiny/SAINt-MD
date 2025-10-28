[file name]: wiki.js
[file content begin]
import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "wiki",
    description: "Search Wikipedia for information",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "📚 *WIKIPEDIA SEARCH*\n\nUsage: wiki [search term]\n\nExample: wiki artificial intelligence",
                    },
                    { quoted: message }
                );
                return;
            }

            const searchQuery = args.join(" ");

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Search Wikipedia
            const wikiData = await searchWikipedia(searchQuery);

            if (!wikiData) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No results found for: " + searchQuery + "\n\nTry a different search term.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getWikiArt()}

📚 *${wikiData.title.toUpperCase()}*

${wikiData.extract}

🔗 *Read more:* ${wikiData.url}

${getWikiArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: response,
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing wiki command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error searching Wikipedia. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Search Wikipedia API
async function searchWikipedia(query) {
    try {
        const response = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
            {
                timeout: 10000,
            }
        );

        if (response.data.extract) {
            return {
                title: response.data.title,
                extract: truncateText(response.data.extract, 800),
                url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching from Wikipedia:", error);
        return null;
    }
}

// Truncate text to fit WhatsApp limits
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Simple cool ASCII art
function getWikiArt() {
    const arts = [
        "➖➖➖➖➖➖➖➖➖➖➖➖➖",
        "━━━━━━━━━━━━━━━━━━",
        "────────────────────",
        "✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦",
        "♡━━━━━━━━━━━━━━━━♡",
        "✼ •• ┈┈┈┈┈┈┈┈┈┈┈ •• ✼",
        "»»————-　★　————-««",
        "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"
    ];
    
    return arts[Math.floor(Math.random() * arts.length)];
}
[file content end]