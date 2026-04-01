import logger from "../utils/logger.js";

export default {
    name: "speech",
    description: "Generate categorized speeches (Inspirational, Formal, Casual)",
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
                        text: `🎤 *SPEECH COMMAND*\n\nUsage:\n• speech [theme/occasion]\n• Reply to any message with: speech\n\nExamples:\n• speech Graduation\n• speech Wedding Toast\n• speech Business Pitch`,
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
                        text: "❌ No theme provided. Please type a theme or reply to a message with: speech",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized speeches
            const results = await generateSpeeches(theme);

            const response = `
${getSpeechArt()}
🎤 *SPEECH GENERATOR*
${getSpeechArt()}

📝 *Theme:* ${theme}

💡 *Inspirational:*  
${results.inspirational}

💡 *Formal:*  
${results.formal}

💡 *Casual:*  
${results.casual}

${getSpeechArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing speech command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating speech. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized speech generator
async function generateSpeeches(theme) {
    try {
        const inspirational = `Ladies and gentlemen, today we celebrate ${theme}. Let this moment remind us that every challenge is a stepping stone toward greatness.`;
        const formal = `Distinguished guests, it is my honor to address you on the occasion of ${theme}. May this event reflect our shared values and commitment to excellence.`;
        const casual = `Hey everyone, ${theme} is a big deal, and I’m glad we’re all here to enjoy it together. Let’s make this moment one to remember!`;

        return { inspirational, formal, casual };
    } catch (error) {
        logger.error("Error generating speeches:", error);
        return { inspirational: "Unable to generate.", formal: "Unable to generate.", casual: "Unable to generate." };
    }
}

// Decorative art for speech messages
function getSpeechArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎤─────────────────🎤",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
