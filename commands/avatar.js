import logger from "../utils/logger.js";

export default {
    name: "avatar",
    description: "Generate categorized avatar info messages (Appearance, Style, Personality, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Avatar Theme";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🧑‍🎨 *AVATAR COMMAND*\n\nUsage:\n• avatar [theme/style]\n• Reply to any message with: avatar\n\nExamples:\n• avatar warrior\n• avatar cyberpunk\n• avatar mystic`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized avatar info
            const results = await generateAvatar(theme);

            const response = `
${getAvatarArt()}
🧑‍🎨 *AVATAR REPORT*
${getAvatarArt()}

📝 *Theme:* ${theme}

💡 *Appearance:*  
${results.appearance}

💡 *Style:*  
${results.style}

💡 *Personality:*  
${results.personality}

💡 *Status:*  
${results.status}

${getAvatarArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing avatar command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating avatar message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized avatar generator
async function generateAvatar(theme) {
    try {
        const appearance = `🎨 "${theme}" avatar has a distinct look.`;
        const style = `✨ "${theme}" avatar carries a unique artistic style.`;
        const personality = `👤 "${theme}" avatar reflects bold traits.`;
        const status = `📊 "${theme}" avatar is trending in digital culture.`;

        return { appearance, style, personality, status };
    } catch (error) {
        logger.error("Error generating avatar info:", error);
        return { appearance: "Unable to generate.", style: "Unable to generate.", personality: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for avatar messages
function getAvatarArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧑‍🎨─────────────────🧑‍🎨",
        "⊱──────── 💡 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
