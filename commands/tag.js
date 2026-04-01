import logger from "../utils/logger.js";

export default {
    name: "tag",
    description: "Tag all group members with a custom message",
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
            const members = metadata.participants.map(p => p.id);

            const customMessage = args.length > 0 
                ? args.join(" ") 
                : "👥 Tagging all members...";

            const response = `
${getTagArt()}
👥 *GROUP TAG ALERT*
${getTagArt()}

📝 Message:  
${customMessage}

👥 Members tagged successfully.
${getTagArt()}
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
            logger.error("Error executing tag command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running tag command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getTagArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👥─────────────────👥",
        "⊱──────── 📢 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
