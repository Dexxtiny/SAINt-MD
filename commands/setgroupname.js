import logger from "../utils/logger.js";

export default {
    name: "setgroupname",
    description: "Set or update the group name/title",
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
                        text: `🏷️ *SETGROUPNAME COMMAND*\n\nUsage:\n• setgroupname [new group name]\n\nExample:\n• setgroupname SAINt-MD Official Group`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const newName = args.join(" ");

            try {
                await client.groupUpdateSubject(groupId, newName);

                const response = `
${getNameArt()}
🏷️ *GROUP NAME UPDATED*
${getNameArt()}

📌 New Name:  
${newName}

💡 Status: Group name changed successfully.
${getNameArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error updating group name:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to update group name. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing setgroupname command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setgroupname command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getNameArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🏷️─────────────────🏷️",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
