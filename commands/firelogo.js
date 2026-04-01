import logger from "../utils/logger.js";

export default {
    name: "firelogo",
    description: "Generate categorized fire logo info messages (Style, Effect, Mood, Status)",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const text = args.join(" ") || quotedText || "Unknown Logo";

            if (!text) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🔥 *FIRELOGO COMMAND*\n\nUsage:\n• firelogo [word/phrase]\n• Reply to any message with: firelogo\n\nExamples:\n• firelogo Destiny\n• firelogo SAINt-MD\n• firelogo Power`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized fire logo info
            const results = await generateFireLogo(text);

            const response = `
${getFireLogoArt()}
🔥 *FIRE LOGO REPORT*
${getFireLogoArt()}

📝 *Text:* ${text}

💡 *Style:*  
${results.style}

💡 *Effect:*  
${results.effect}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getFireLogoArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing firelogo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating firelogo message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized fire logo generator
async function generateFireLogo(text) {
    try {
        const style = `🎨 "${text}" is styled with blazing flames.`;
        const effect = `🔥 "${text}" glows with a fiery aura.`;
        const mood = `✨ "${text}" conveys power and intensity.`;
        const status = `📊 "${text}" stands out as a bold fire logo.`;

        return { style, effect, mood, status };
    } catch (error) {
        logger.error("Error generating firelogo info:", error);
        return { style: "Unable to generate.", effect: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for firelogo messages
function getFireLogoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔥─────────────────🔥",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
