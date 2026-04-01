import logger from "../utils/logger.js";

export default {
    name: "venice",
    description: "Generate elegant themed messages about Venice or a given topic",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Venice";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌉 *VENICE COMMAND*\n\nUsage:\n• venice [theme]\n• Reply to any message with: venice\n\nExamples:\n• venice Romance\n• venice Adventure\n• venice History`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate Venice-themed message
            const results = await generateVenice(theme);

            const response = `
${getVeniceArt()}
🌉 *VENICE GENERATOR*
${getVeniceArt()}

📝 *Theme:* ${theme}

💡 *Message:*  
${results}

${getVeniceArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing venice command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Venice message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Venice message generator
async function generateVenice(theme) {
    try {
        const messages = [
            `In the heart of ${theme}, Venice whispers stories through its canals, where every ripple carries centuries of romance.`,
            `Venice transforms ${theme} into poetry — gondolas gliding under moonlit bridges, echoing timeless beauty.`,
            `The spirit of ${theme} in Venice is eternal: art, love, and history flowing together like water through its veins.`
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    } catch (error) {
        logger.error("Error generating Venice message:", error);
        return "Unable to generate Venice message.";
    }
}

// Decorative art for Venice messages
function getVeniceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌉─────────────────🌉",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌊 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
