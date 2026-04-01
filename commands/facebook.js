import logger from "../utils/logger.js";

export default {
    name: "facebook",
    description: "Generate categorized Facebook-style posts (Personal, Celebratory, Reflective)",
    category: "social",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const topic = args.join(" ") || quotedText || "Life Update";

            if (!topic) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📘 *FACEBOOK COMMAND*\n\nUsage:\n• facebook [topic]\n• Reply to any message with: facebook\n\nExamples:\n• facebook Family Time\n• facebook New Job\n• facebook Weekend Vibes`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized Facebook posts
            const results = await generateFacebook(topic);

            const response = `
${getFacebookArt()}
📘 *FACEBOOK POST GENERATOR*
${getFacebookArt()}

📝 *Topic:* ${topic}

💡 *Personal:*  
${results.personal}

💡 *Celebratory:*  
${results.celebratory}

💡 *Reflective:*  
${results.reflective}

${getFacebookArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing facebook command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating Facebook post. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized Facebook post generator
async function generateFacebook(topic) {
    try {
        const personal = `Just sharing a little joy today — ${topic} makes me smile.`;
        const celebratory = `🎉 Big news! ${topic} is worth celebrating with everyone!`;
        const reflective = `Thinking deeply about ${topic} — sometimes the quiet moments teach us the most.`;

        return { personal, celebratory, reflective };
    } catch (error) {
        logger.error("Error generating Facebook posts:", error);
        return { personal: "Unable to generate.", celebratory: "Unable to generate.", reflective: "Unable to generate." };
    }
}

// Decorative art for Facebook messages
function getFacebookArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📘─────────────────📘",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌟 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
