import logger from "../utils/logger.js";

export default {
    name: "everyone",
    description: "Tag all group members",
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

            const metadata = await client.groupMetadata(groupId);
            const members = metadata.participants.map(p => p.id);

            const announcement = args.join(" ") || "Attention everyone!";

            const response = `
${getEveryoneArt()}
👥 *EVERYONE TAG ALERT*
${getEveryoneArt()}

📝 *Message:*  
${announcement}

💡 *Tagged Members:*  
${members.map(m => `@${m.split("@")[0]}`).join(" ")}

${getEveryoneArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                {
                    text: response,
                    mentions: members
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing everyone command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error tagging everyone. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getEveryoneArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👥─────────────────👥",
        "⊱──────── 📢 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
