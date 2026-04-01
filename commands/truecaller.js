import logger from "../utils/logger.js";

export default {
    name: "truecaller",
    description: "Generate categorized caller ID info messages (Identity, Location, Carrier, Status)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const target = args.join(" ") || quotedText || "Unknown Caller";

            if (!target) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📞 *TRUECALLER COMMAND*\n\nUsage:\n• truecaller [number/name]\n• Reply to any message with: truecaller\n\nExamples:\n• truecaller +2348012345678\n• truecaller Destiny\n• truecaller SAINt-MD`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized caller info
            const results = await generateTruecaller(target);

            const response = `
${getTruecallerArt()}
📞 *CALLER ID REPORT*
${getTruecallerArt()}

📝 *Target:* ${target}

💡 *Identity:*  
${results.identity}

💡 *Location:*  
${results.location}

💡 *Carrier:*  
${results.carrier}

💡 *Status:*  
${results.status}

${getTruecallerArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing truecaller command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating truecaller message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized caller info generator
async function generateTruecaller(target) {
    try {
        const identity = `👤 ${target} is recognized as a caller identity.`;
        const location = `🌍 ${target} is mapped to a region.`;
        const carrier = `📡 ${target} is associated with a telecom provider.`;
        const status = `📊 ${target} is active and reachable.`;

        return { identity, location, carrier, status };
    } catch (error) {
        logger.error("Error generating truecaller info:", error);
        return { identity: "Unable to generate.", location: "Unable to generate.", carrier: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for truecaller messages
function getTruecallerArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📞─────────────────📞",
        "⊱──────── 💡 ────────⊰",
        "»»────── 📡 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
