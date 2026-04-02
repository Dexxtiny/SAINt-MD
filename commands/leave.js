import logger from "../utils/logger.js";

export default {
    name: "leave",
    description: "Leave a WhatsApp group",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            // Ensure it's a group chat
            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ This command can only be used in a group chat." },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("typing", chatId);

            // Leave the group
            await client.groupLeave(chatId);

            const response = `
${getLeaveArt()}
🚪 *LEAVE COMMAND EXECUTED*
${getLeaveArt()}

✅ Bot has successfully left the group.  
⚡ Goodbye and see you next time.

${getLeaveArt()}
            `.trim();

            // Send confirmation to the owner privately (optional)
            await client.sendMessage(
                message.key.participant || chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing leave command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running leave command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getLeaveArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚪─────────────────🚪",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
