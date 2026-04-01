import logger from "../utils/logger.js";

export default {
    name: "groupinfo",
    description: "Fetch detailed group information",
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

            await client.sendPresenceUpdate("composing", groupId);

            const metadata = await client.groupMetadata(groupId);

            const response = `
${getGroupInfoArt()}
👥 *GROUP INFO REPORT*
${getGroupInfoArt()}

📝 *Group Name:* ${metadata.subject}
🆔 *Group ID:* ${groupId}
👤 *Owner:* ${metadata.owner || "Unknown"}
📅 *Created:* ${new Date(metadata.creation * 1000).toLocaleString()}
👥 *Members:* ${metadata.participants.length}
💬 *Description:* ${metadata.desc || "No description set."}

💡 *Status:*  
Successfully fetched group information.

${getGroupInfoArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing groupinfo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error fetching group info. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getGroupInfoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👥─────────────────👥",
        "⊱──────── 📝 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
