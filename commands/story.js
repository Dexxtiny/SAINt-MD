import logger from "../utils/logger.js";

export default {
    name: "story",
    description: "Generate categorized short stories (Adventure, Mystery, Fantasy)",
    category: "creative",

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
                        text: `📖 *STORY COMMAND*\n\nUsage:\n• story [theme]\n• Reply to any message with: story\n\nExamples:\n• story Adventure in the Forest\n• story Lost Treasure\n• story Space Journey`,
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
                        text: "❌ No theme provided. Please type a theme or reply to a message with: story",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized stories
            const results = await generateStories(theme);

            const response = `
${getStoryArt()}
📖 *STORY GENERATOR*
${getStoryArt()}

📝 *Theme:* ${theme}

💡 *Adventure:*  
${results.adventure}

💡 *Mystery:*  
${results.mystery}

💡 *Fantasy:*  
${results.fantasy}

${getStoryArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing story command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating story. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized story generator
async function generateStories(theme) {
    try {
        const adventure = `In ${theme}, a daring traveler set out on a journey where every step revealed a new challenge — and a hidden treasure waiting at the end.`;
        const mystery = `Whispers surrounded ${theme}, where shadows hid secrets no one dared to uncover — until one curious soul followed the clues.`;
        const fantasy = `Within ${theme}, magic flowed through the air, and a single spark of courage was enough to awaken legends long forgotten.`;

        return { adventure, mystery, fantasy };
    } catch (error) {
        logger.error("Error generating stories:", error);
        return { adventure: "Unable to generate.", mystery: "Unable to generate.", fantasy: "Unable to generate." };
    }
}

// Decorative art for story messages
function getStoryArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📖─────────────────📖",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌌 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
