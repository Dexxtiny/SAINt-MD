import logger from "../utils/logger.js";

export default {
    name: "invitelink",
    description: "Fetch the group invite link",
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

            try {
                const inviteCode = await client.groupInviteCode(groupId);
                const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

                const response = `
${getInviteArt()}
🔗 *GROUP INVITE LINK*
${getInviteArt()}

📝 *Link:*  
${inviteLink}

💡 *Status:*  
Successfully fetched the group invite link.

${getInviteArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error fetching group invite link:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to fetch group invite link. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing invitelink command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running invitelink. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getInviteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔗─────────────────🔗",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
