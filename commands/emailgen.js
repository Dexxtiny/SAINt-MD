import logger from "../utils/logger.js";

export default {
    name: "emailgen",
    description: "Generate categorized email drafts (Formal, Friendly, Concise)",
    category: "utility",

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
                        text: `📧 *EMAILGEN COMMAND*\n\nUsage:\n• emailgen [prompt]\n• Reply to any message with: emailgen\n\nExamples:\n• emailgen Request meeting with manager\n• emailgen Thank client for support\n• emailgen Follow-up on project proposal`,
                    },
                    { quoted: message }
                );
                return;
            }

            const prompt = args.join(" ") || quotedText;

            if (!prompt) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No prompt provided. Please type a request or reply to a message with: emailgen",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized drafts
            const results = await generateEmailDrafts(prompt);

            const response = `
${getEmailArt()}
📧 *EMAIL DRAFTS*
${getEmailArt()}

📝 *Prompt:* ${prompt}

💡 *Formal:*  
${results.formal}

💡 *Friendly:*  
${results.friendly}

💡 *Concise:*  
${results.concise}

${getEmailArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing emailgen command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating email drafts. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized email draft generator
async function generateEmailDrafts(prompt) {
    try {
        const formal = `Subject: ${prompt}\n\nDear [Recipient],\n\nI am writing to formally address ${prompt}. Please let me know your availability or feedback at your earliest convenience.\n\nSincerely,\n[Your Name]`;

        const friendly = `Subject: ${prompt}\n\nHi [Recipient],\n\nHope you’re doing well! Just wanted to touch base about ${prompt}. Looking forward to hearing from you.\n\nBest,\n[Your Name]`;

        const concise = `Subject: ${prompt}\n\nHello [Recipient],\n\nQuick note regarding ${prompt}. Please advise.\n\nThanks,\n[Your Name]`;

        return { formal, friendly, concise };
    } catch (error) {
        logger.error("Error generating email drafts:", error);
        return { formal: "Unable to generate.", friendly: "Unable to generate.", concise: "Unable to generate." };
    }
}

// Decorative art for emailgen messages
function getEmailArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📧─────────────────📧",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📝 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
