import logger from "../utils/logger.js";

export default {
    name: "listsudo",
    description: "List all users currently in the sudo list",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Retrieve sudo list from DB
            const sudoUsers = db.getConfig("sudoUsers") || [];

            if (sudoUsers.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ No users are currently in the sudo list." },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getSudoArt()}
📜 *LISTSUDO*
${getSudoArt()}

✅ Current sudo users:  
${sudoUsers.map(u => `- ${u}`).join("\n")}

⚡ Use \`delsudo <number>\` to remove a user.  
⚡ Use \`addsudo <number>\` to add new sudo users.

${getSudoArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing listsudo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running listsudo command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getSudoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📜─────────────────📜",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
