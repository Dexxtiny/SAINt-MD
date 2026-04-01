import logger from "../utils/logger.js";

export default {
    name: "namecheck",
    description: "Check a name for uniqueness, meaning, origin, and popularity",
    category: "utility",

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
                        text: `🔎 *NAMECHECK COMMAND*\n\nUsage:\n• namecheck [name]\n• Reply to any message with: namecheck\n\nExamples:\n• namecheck Destiny\n• namecheck Alexander\n• namecheck Aisha`,
                    },
                    { quoted: message }
                );
                return;
            }

            const name = args.join(" ") || quotedText;

            if (!name) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No name provided. Please type a name or reply to a message with: namecheck",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate name analysis
            const result = await analyzeName(name);

            const response = `
${getNameArt()}
🔎 *NAME CHECK*
${getNameArt()}

📝 *Name:* ${name}

💡 *Meaning/Vibe:*  
${result.meaning}

🌍 *Origin:*  
${result.origin}

📊 *Popularity:*  
${result.popularity}

${getNameArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing namecheck command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error checking name. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Name analysis generator with origin and popularity
async function analyzeName(name) {
    try {
        const meanings = [
            `${name} carries a sense of strength and resilience.`,
            `${name} is often associated with creativity and leadership.`,
            `${name} has roots in history and culture, symbolizing wisdom.`,
            `${name} feels unique and modern, yet timeless.`,
            `${name} resonates with positivity and ambition.`
        ];

        const origins = [
            "Greek origin, linked to philosophy and wisdom.",
            "Latin origin, tied to ancient Rome.",
            "Arabic origin, symbolizing faith and beauty.",
            "English origin, popular in modern times.",
            "African origin, rich in cultural heritage."
        ];

        const popularity = [
            "Most popular in the 1990s.",
            "Trending in the 2000s.",
            "Classic name, popular for centuries.",
            "Rare but gaining attention recently.",
            "Timeless, steady popularity across generations."
        ];

        return {
            meaning: meanings[Math.floor(Math.random() * meanings.length)],
            origin: origins[Math.floor(Math.random() * origins.length)],
            popularity: popularity[Math.floor(Math.random() * popularity.length)]
        };
    } catch (error) {
        logger.error("Error analyzing name:", error);
        return { meaning: "Unable to analyze.", origin: "Unknown.", popularity: "Unknown." };
    }
}

// Decorative art for namecheck messages
function getNameArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔎─────────────────🔎",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
