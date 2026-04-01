import logger from "../utils/logger.js";

export default {
    name: "listadmins",
    description: "List all group admins and owner",
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

            const owner = metadata.owner || "Unknown";
            const admins = metadata.participants
                .filter(p => p.admin !== null && p.id !== owner)
                .map(p => p.id);

            const response = `
${getAdminsArt()}
👑 *GROUP ADMINS REPORT*
${getAdminsArt()}

👤 *Owner:*  
@${owner.split("@")[0]}

👥 *Admins:*  
${admins.length > 0 ? admins.map(a => `@${a.split("@")[0]}`).join("\n") : "No other admins found."}

💡 *Status:*  
Fetched group owner and admins successfully.

${getAdminsArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: [owner, ...admins]
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing listadmins command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error fetching group admins. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getAdminsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👑─────────────────👑",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
