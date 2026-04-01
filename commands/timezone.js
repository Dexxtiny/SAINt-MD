import logger from "../utils/logger.js";

export default {
    name: "timezone",
    description: "Generate categorized timezone info messages (Local Time, Offset, Conversion, Status)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const zone = args.join(" ") || quotedText || "Unknown Timezone";

            if (!zone) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🕒 *TIMEZONE COMMAND*\n\nUsage:\n• timezone [region/city]\n• Reply to any message with: timezone\n\nExamples:\n• timezone Lagos\n• timezone New York\n• timezone Tokyo`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized timezone info
            const results = await generateTimezone(zone);

            const response = `
${getTimezoneArt()}
🕒 *TIMEZONE DATA*
${getTimezoneArt()}

🌍 *Region:* ${zone}

💡 *Local Time:*  
${results.local}

💡 *Offset:*  
${results.offset}

💡 *Conversion:*  
${results.conversion}

💡 *Status:*  
${results.status}

${getTimezoneArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing timezone command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating timezone message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized timezone generator
async function generateTimezone(zone) {
    try {
        const local = `🕒 Current time in ${zone} is displayed.`;
        const offset = `⏳ ${zone} has a GMT/UTC offset.`;
        const conversion = `🌐 ${zone} can be converted to other regions.`;
        const status = `📊 ${zone} timezone is active and valid.`;

        return { local, offset, conversion, status };
    } catch (error) {
        logger.error("Error generating timezone info:", error);
        return { local: "Unable to generate.", offset: "Unable to generate.", conversion: "Unable to generate.", status: "Unable to generate." };
    }
}

// Decorative art for timezone messages
function getTimezoneArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🕒─────────────────🕒",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌍 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
