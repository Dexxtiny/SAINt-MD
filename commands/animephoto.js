import logger from "../utils/logger.js";

export default {
    name: "animephoto",
    description: "Generate categorized anime photo info messages (Style, Character, Mood, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Anime Theme";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🎌 *ANIMEPHOTO COMMAND*\n\nUsage:\n• animephoto [character/theme]\n• Reply to any message with: animephoto\n\nExamples:\n• animephoto samurai\n• animephoto magical girl\n• animephoto cyberpunk`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized anime photo info
            const results = await generateAnimePhoto(theme);

            const response = `
${getAnimeArt()}
🎌 *ANIME PHOTO REPORT*
${getAnimeArt()}

📝 *Theme:* ${theme}

💡 *Style:*  
${results.style}

💡 *Character:*  
${results.character}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getAnimeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing animephoto command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating animephoto message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized anime photo generator
async function generateAnimePhoto(theme) {
    try {
        const style = `🎨 "${theme}" is drawn in vibrant anime style.`;
        const character = `👤 "${theme}" features a unique anime character.`;
        const mood = `✨ "${theme}" carries a dramatic or playful vibe.`;
        const status = `📊 "${theme}" is popular in anime culture.`;

        return { style, character, mood, status };
    } catch (error) {
        logger.error("Error generating animephoto info:", error);
        return { style: "Unable to generate.", character: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for anime messages
function getAnimeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎌─────────────────🎌",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
