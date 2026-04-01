import logger from "../utils/logger.js";

export default {
    name: "setdesc",
    description: "Set or update the group description",
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

            if (args.length < 1) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `📝 *SETDESC COMMAND*\n\nUsage:\n• setdesc [new description]\n\nExample:\n• setdesc Welcome to SAINt-MD official group!`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const newDesc = args.join(" ");

            try {
                await client.groupUpdateDescription(groupId, newDesc);

                const response = `
${getDescArt()}
📝 *GROUP DESCRIPTION UPDATED*
${getDescArt()}

📌 New Description:  
${newDesc}

💡 Status: Group description set successfully.
${getDescArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error updating group description:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to update group description. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing setdesc command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setdesc command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getDescArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
