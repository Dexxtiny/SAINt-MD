import logger from "../utils/logger.js";

export default {
    name: "neko",
    description: "Generate categorized neko info messages (Appearance, Personality, Mood, Status)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Neko";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🐾 *NEKO COMMAND*\n\nUsage:\n• neko [theme]\n• Reply to any message with: neko\n\nExamples:\n• neko cute neko\n• neko neko maid\n• neko neko warrior`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized neko info
            const results = await generateNeko(theme);

            const response = `
${getNekoArt()}
🐾 *NEKO REPORT*
${getNekoArt()}

📝 *Theme:* ${theme}

💡 *Appearance:*  
${results.appearance}

💡 *Personality:*  
${results.personality}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getNekoArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing neko command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating neko message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized neko generator
async function generateNeko(theme) {
    try {
        const appearance = `🎨 "${theme}" neko has cat ears and a playful look.`;
        const personality = `😸 "${theme}" neko is mischievous yet charming.`;
        const mood = `✨ "${theme}" neko radiates cuteness and energy.`;
        const status = `📊 "${theme}" neko is popular in anime culture.`;

        return { appearance, personality, mood, status };
    } catch (error) {
        logger.error("Error generating neko info:", error);
        return { appearance: "Unable to generate.", personality: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for neko messages
function getNekoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐾─────────────────🐾",
        "⊱──────── 💡 ────────⊰",
        "»»────── 😸 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
