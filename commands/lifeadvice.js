import logger from "../utils/logger.js";

export default {
    name: "lifeadvice",
    description: "Generate multiple practical life advice tips based on a theme",
    category: "wisdom",

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
                        text: `🌱 *LIFEADVICE COMMAND*\n\nUsage:\n• lifeadvice [theme]\n• Reply to any message with: lifeadvice\n\nExamples:\n• lifeadvice Happiness\n• lifeadvice Career growth\n• lifeadvice Overcoming failure`,
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
                        text: "❌ No theme provided. Please add a subject or reply to a message with: lifeadvice",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate multiple life advice tips
            const results = await generateLifeAdvice(theme);

            const response = `
${getAdviceArt()}
🌱 *LIFE ADVICE*
${getAdviceArt()}

📝 *Theme:* ${theme}

💡 *Tips:*  
${results.map((tip, i) => `${i + 1}. ${tip}`).join("\n")}

${getAdviceArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing lifeadvice command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating life advice. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Multiple life advice generator
async function generateLifeAdvice(theme) {
    try {
        const advices = [
            `On ${theme}, progress matters more than perfection. Small steps daily lead to big changes.`,
            `When it comes to ${theme}, consistency beats intensity. Build habits that last.`,
            `Balance is key in ${theme} — don’t neglect health, relationships, or peace of mind.`,
            `For ${theme}, embrace failure as feedback. Every setback is a lesson in disguise.`,
            `In ${theme}, surround yourself with positive influences. The right environment shapes growth.`
        ];
        // Return 3–5 random tips
        return advices.sort(() => 0.5 - Math.random()).slice(0, 4);
    } catch (error) {
        logger.error("Error generating life advice:", error);
        return ["Unable to generate life advice."];
    }
}

// Decorative art for lifeadvice messages
function getAdviceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌱─────────────────🌱",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
