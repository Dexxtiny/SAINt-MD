import logger from "../utils/logger.js";

export default {
    name: "link",
    description: "Get or reset the group invite link",
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
                let inviteCode;

                if (args[0] && args[0].toLowerCase() === "reset") {
                    // Reset the group invite link
                    await client.groupRevokeInvite(groupId);
                    inviteCode = await client.groupInviteCode(groupId);
                } else {
                    // Fetch existing invite link
                    inviteCode = await client.groupInviteCode(groupId);
                }

                const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

                const response = `
${getLinkArt()}
🔗 *GROUP LINK REPORT*
${getLinkArt()}

📝 *Link:*  
${inviteLink}

💡 *Status:*  
${args[0] && args[0].toLowerCase() === "reset" ? "Invite link reset successfully." : "Invite link fetched successfully."}

${getLinkArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error fetching/resetting group link:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to fetch or reset group link. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing link command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running link command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getLinkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔗─────────────────🔗",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
