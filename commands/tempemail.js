import logger from "../utils/logger.js";

export default {
    name: "tempemail",
    description: "Generate categorized temporary email info messages (Address, Inbox Status, Expiry, Usage)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const label = args.join(" ") || quotedText || "Temp Inbox";

            if (!label) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📧 *TEMPEMAIL COMMAND*\n\nUsage:\n• tempemail [label]\n• Reply to any message with: tempemail\n\nExamples:\n• tempemail project\n• tempemail test\n• tempemail SAINt-MD`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized temp email info
            const results = await generateTempEmail(label);

            const response = `
${getTempEmailArt()}
📧 *TEMPORARY EMAIL REPORT*
${getTempEmailArt()}

📝 *Label:* ${label}

💡 *Address:*  
${results.address}

💡 *Inbox Status:*  
${results.inbox}

💡 *Expiry:*  
${results.expiry}

💡 *Usage:*  
${results.usage}

${getTempEmailArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tempemail command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating tempemail message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized temp email generator
async function generateTempEmail(label) {
    try {
        const address = `📧 Generated address: ${label.toLowerCase()}@tempmail.com`;
        const inbox = `📥 Inbox is empty — waiting for new mail.`;
        const expiry = `⏳ This email will expire in 10 minutes.`;
        const usage = `⚡ Use ${label}@tempmail.com for quick signups or tests.`;

        return { address, inbox, expiry, usage };
    } catch (error) {
        logger.error("Error generating tempemail info:", error);
        return { address: "Unable to generate.", inbox: "Unable to generate.", expiry: "Unable to generate.", usage: "Unable to generate." };
    }
}

// Decorative art for tempemail messages
function getTempEmailArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📧─────────────────📧",
        "⊱──────── 💡 ────────⊰",
        "»»────── ⏳ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
