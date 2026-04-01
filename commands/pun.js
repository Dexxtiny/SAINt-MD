import logger from "../utils/logger.js";

export default {
    name: "pun",
    description: "Generate categorized puns (Dad Joke, Smart Wordplay, Cheeky Pun)",
    category: "fun",

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
                        text: `😂 *PUN COMMAND*\n\nUsage:\n• pun [word/theme]\n• Reply to any message with: pun\n\nExamples:\n• pun Coffee\n• pun Cats\n• pun Coding`,
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
                        text: "❌ No theme provided. Please type a word/theme or reply to a message with: pun",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized puns
            const results = await generatePuns(theme);

            const response = `
${getPunArt()}
😂 *PUN TIME*
${getPunArt()}

📝 *Theme:* ${theme}

💡 *Dad Joke:*  
${results.dad}

💡 *Smart Wordplay:*  
${results.smart}

💡 *Cheeky Pun:*  
${results.cheeky}

${getPunArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing pun command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating pun. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized pun generator
async function generatePuns(theme) {
    try {
        const dad = `I was going to tell you a ${theme} joke… but it’s too pun-derful to handle!`;
        const smart = `Without ${theme}, life would lose its pun-ctuation of wit.`;
        const cheeky = `I tried to avoid a ${theme} pun, but it was pun-avoidable — deal with it!`;

        return { dad, smart, cheeky };
    } catch (error) {
        logger.error("Error generating puns:", error);
        return { dad: "Unable to generate.", smart: "Unable to generate.", cheeky: "Unable to generate." };
    }
}

// Decorative art for pun messages
function getPunArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "😂─────────────────😂",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎭 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
