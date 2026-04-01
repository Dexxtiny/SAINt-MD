import logger from "../utils/logger.js";

export default {
    name: "getgrouppp",
    description: "Fetch the group profile picture",
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
                const ppUrl = await client.profilePictureUrl(groupId, "image");

                if (!ppUrl) {
                    await client.sendMessage(
                        groupId,
                        { text: "⚠️ No profile picture set for this group." },
                        { quoted: message }
                    );
                    return;
                }

                await client.sendMessage(
                    groupId,
                    {
                        image: { url: ppUrl },
                        caption: `
${getGroupPPArt()}
🖼️ *GROUP PROFILE PICTURE*
${getGroupPPArt()}

✅ Successfully fetched the group PP.
${getGroupPPArt()}
                        `.trim(),
                    },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error fetching group profile picture:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to fetch group profile picture." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing getgrouppp command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running getgrouppp. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getGroupPPArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🖼️─────────────────🖼️",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
