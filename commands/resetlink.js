import logger from "../utils/logger.js";

export default {
    name: "resetlink",
    description: "Reset the group invite link",
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
                // Revoke old invite link and generate a new one
                await client.groupRevokeInvite(groupId);
                const inviteCode = await client.groupInviteCode(groupId);
                const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

                const response = `
${getResetArt()}
🔄 *GROUP LINK RESET*
${getResetArt()}

📝 *New Link:*  
${inviteLink}

💡 *Status:*  
Invite link reset successfully.

${getResetArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error resetting group link:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to reset group link. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing resetlink command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running resetlink command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getResetArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔄─────────────────🔄",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
