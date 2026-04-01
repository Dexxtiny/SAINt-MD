import logger from "../utils/logger.js";

export default {
    name: "activity",
    description: "Generate styled activity ideas",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const theme = args.join(" ") || quotedText || "Unknown Activity";

            if (!theme) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🕹️ *ACTIVITY COMMAND*\n\nUsage:\n• activity [theme]\n• Reply to any message with: activity\n\nExamples:\n• activity weekend\n• activity creative\n• activity team bonding`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const results = await generateActivity(theme);

            const response = `
${getActivityArt()}
🕹️ *ACTIVITY REPORT*
${getActivityArt()}

📝 *Theme:* ${theme}

💡 *Idea:*  
${results.idea}

💡 *Setup:*  
${results.setup}

💡 *Mood:*  
${results.mood}

💡 *Status:*  
${results.status}

${getActivityArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing activity command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating activity message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

async function generateActivity(theme) {
    try {
        const idea = `🎯 "${theme}" activity could be a themed challenge or group game.`;
        const setup = `🛠️ "${theme}" setup involves minimal gear and lots of creativity.`;
        const mood = `✨ "${theme}" activity sparks fun and engagement.`;
        const status = `📊 "${theme}" activity is trending and well-loved.`;

        return { idea, setup, mood, status };
    } catch (error) {
        logger.error("Error generating activity info:", error);
        return { idea: "Unable to generate.", setup: "Unable to generate.", mood: "Unable to generate.", status: "Unable to generate." };
    }
}

function getActivityArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🕹️─────────────────🕹️",
        "⊱──────── 🎯 ────────⊰",
        "»»────── ✨ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
