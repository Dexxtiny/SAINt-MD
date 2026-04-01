import logger from "../utils/logger.js";

export default {
    name: "announce",
    description: "Broadcast announcements in groups",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            const announcement = args.join(" ") || null;

            if (!announcement) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `📢 *ANNOUNCE COMMAND*\n\nUsage:\n• announce [message]\n\nExamples:\n• announce Meeting starts at 5 PM\n• announce Tomorrow is a holiday`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const response = `
${getAnnounceArt()}
📢 *GROUP ANNOUNCEMENT*
${getAnnounceArt()}

📝 *Message:*  
${announcement}

💡 *Status:*  
Announcement delivered successfully.

${getAnnounceArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing announce command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error sending announcement. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getAnnounceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📢─────────────────📢",
        "⊱──────── 📝 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
