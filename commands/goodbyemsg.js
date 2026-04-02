import logger from "../utils/logger.js";

export default {
    name: "setgoodbyemsg",
    description: "Set a custom goodbye message for members leaving the group",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Goodbye messages can only be set in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the custom goodbye message you want to set." },
                    { quoted: message }
                );
                return;
            }

            const customMsg = args.join(" ");

            // Save custom goodbye message in DB
            await db.set(`goodbyeMsg_${chatId}`, customMsg);

            const response = `
${getGoodbyeMsgArt()}
👋 *SETGOODBYEMSG COMMAND EXECUTED*
${getGoodbyeMsgArt()}

✅ Custom goodbye message has been set successfully.  
📌 New Message:  
"${customMsg}"

${getGoodbyeMsgArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing setgoodbyemsg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running setgoodbyemsg command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getGoodbyeMsgArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👋─────────────────👋",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
