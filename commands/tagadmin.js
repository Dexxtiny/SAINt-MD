import logger from "../utils/logger.js";

export default {
    name: "tagadmin",
    description: "Tag all group admins with a custom message",
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
            const admins = metadata.participants
                .filter(p => p.admin !== null)
                .map(p => p.id);

            if (admins.length < 1) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ No admins found in this group." },
                    { quoted: message }
                );
                return;
            }

            const customMessage = args.length > 0 
                ? args.join(" ") 
                : "👑 Tagging all admins...";

            const response = `
${getTagAdminArt()}
👑 *GROUP ADMIN TAG ALERT*
${getTagAdminArt()}

📝 Message:  
${customMessage}

👑 Admins tagged successfully.
${getTagAdminArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: admins
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing tagadmin command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running tagadmin command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getTagAdminArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👑─────────────────👑",
        "⊱──────── 📢 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
