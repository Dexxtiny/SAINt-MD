import logger from "../utils/logger.js";

export default {
    name: "totalmember",
    description: "Show the total number of group members",
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
            const totalMembers = metadata.participants.length;

            const response = `
${getMemberArt()}
👥 *GROUP MEMBER COUNT*
${getMemberArt()}

📌 Total Members:  
${totalMembers}

💡 Status: Count retrieved successfully.
${getMemberArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing totalmember command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running totalmember command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getMemberArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👥─────────────────👥",
        "⊱──────── 📊 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
