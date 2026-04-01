import logger from "../utils/logger.js";

export default {
    name: "setsubject",
    description: "Set or update the group subject/title",
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
                        text: `🏷️ *SETSUBJECT COMMAND*\n\nUsage:\n• setsubject [new group name]\n\nExample:\n• setsubject SAINt-MD Official Group`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const newSubject = args.join(" ");

            try {
                await client.groupUpdateSubject(groupId, newSubject);

                const response = `
${getSubjectArt()}
🏷️ *GROUP SUBJECT UPDATED*
${getSubjectArt()}

📌 New Subject:  
${newSubject}

💡 Status: Group name changed successfully.
${getSubjectArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error updating group subject:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to update group subject. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing setsubject command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setsubject command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getSubjectArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🏷️─────────────────🏷️",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
