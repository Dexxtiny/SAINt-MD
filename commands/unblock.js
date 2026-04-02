import logger from "../utils/logger.js";

export default {
    name: "unblock",
    description: "Unblock a user so they can message the bot again",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the number or mention the user you want to unblock." },
                    { quoted: message }
                );
                return;
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // Unblock the user
            await client.updateBlockStatus(targetNumber, "unblock");

            const response = `
${getUnblockArt()}
✅ *UNBLOCK COMMAND EXECUTED*
${getUnblockArt()}

📌 Target: *${args[0]}*  
⚡ User has been unblocked successfully.  
They can now message the bot again.

${getUnblockArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing unblock command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running unblock command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getUnblockArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "✅─────────────────✅",
        "⊱──────── ⚡ ────────⊰",
        "»»────── 🚫 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
