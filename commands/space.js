import logger from "../utils/logger.js";

export default {
    name: "space",
    description: "Generate categorized space info messages (Visual, Phenomena, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Space";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌌 *SPACE COMMAND*\n\nUsage:\n• space [theme]\n• Reply to any message with: space\n\nExamples:\n• space galaxy\n• space black hole\n• space nebula`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateSpace(theme);

            const response = `
${getSpaceArt()}
🌌 *SPACE REPORT*
${getSpaceArt()}

📝 *Theme:* ${theme}

💡 *Visual:*  
${results.visual}

💡 *Phenomena:*  
${results.phenomena}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getSpaceArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing space command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating space message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateSpace(theme) {
    try {
        const visual = `🎨 "${theme}" appears as a vast cosmic view.`;
        const phenomena = `🌠 "${theme}" is shaped by celestial phenomena.`;
        const mood = `✨ "${theme}" conveys mystery and awe.`;
        const status = `📊 "${theme}" is studied and admired worldwide.`;

        return { visual, phenomena, mood, status };
    } catch (error) {
        logger.error("Error generating space info:", error);
        return { visual: "Unable to generate.", phenomena: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

function getSpaceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌌─────────────────🌌",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌠 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
