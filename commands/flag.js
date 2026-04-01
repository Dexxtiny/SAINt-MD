import logger from "../utils/logger.js";

export default {
    name: "flag",
    description: "Generate categorized flag info messages (Symbolism, Colors, Meaning)",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const country = args.join(" ") || quotedText || "Unknown Country";

            if (!country) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🏳️ *FLAG COMMAND*\n\nUsage:\n• flag [country]\n• Reply to any message with: flag\n\nExamples:\n• flag Nigeria\n• flag Japan\n• flag Brazil`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized flag messages
            const results = await generateFlag(country);

            const response = `
${getFlagArt()}
🏳️ *FLAG INFO*
${getFlagArt()}

📝 *Country:* ${country}

💡 *Symbolism:*  
${results.symbolism}

💡 *Colors:*  
${results.colors}

💡 *Meaning:*  
${results.meaning}

${getFlagArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing flag command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating flag message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized flag message generator
async function generateFlag(country) {
    try {
        const symbolism = `🏳️ The flag of ${country} represents unity and national pride.`;
        const colors = `🎨 ${country}'s flag features colors symbolizing heritage and culture.`;
        const meaning = `📖 Each element of ${country}'s flag carries historical or cultural meaning.`;

        return { symbolism, colors, meaning };
    } catch (error) {
        logger.error("Error generating flag message:", error);
        return { symbolism: "Unable to generate.", colors: "Unable to generate.", meaning: "Unable to generate." };
    }
}

// Decorative art for flag messages
function getFlagArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🏳️─────────────────🏳️",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎨 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
