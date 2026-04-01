import logger from "../utils/logger.js";

export default {
    name: "affirmation",
    description: "Generate styled affirmation messages",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "General Affirmation";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌟 *AFFIRMATION COMMAND*\n\nUsage:\n• affirmation [theme]\n• Reply to any message with: affirmation\n\nExamples:\n• affirmation confidence\n• affirmation peace\n• affirmation success`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateAffirmation(theme);

            const response = `
${getAffirmationArt()}
🌟 *AFFIRMATION REPORT*
${getAffirmationArt()}

📝 *Theme:* ${theme}

💡 *Statement:*  
${results.statement}

💡 *Focus:*  
${results.focus}

💡 *Energy:*  
${results.energy}

💡 *Status:*  
${results.status}

${getAffirmationArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing affirmation command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating affirmation message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateAffirmation(theme) {
    try {
        const statement = `💖 "${theme}" affirmation: I am strong and capable.`;
        const focus = `🎯 "${theme}" focus: direct energy toward growth and positivity.`;
        const energy = `✨ "${theme}" energy: radiate confidence and peace.`;
        const status = `📊 "${theme}" affirmation is empowering and timeless.`;

        return { statement, focus, energy, status };
    } catch (error) {
        logger.error("Error generating affirmation info:", error);
        return { statement: "Unable to generate.", focus: "Unable to generate.", energy: "Unable to generate.", status: "Unable to generate." };
    }
}

function getAffirmationArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌟─────────────────🌟",
        "⊱──────── 💖 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
