import logger from "../utils/logger.js";

export default {
    name: "setwelcomemsg",
    description: "Set a custom welcome message for new members joining the group",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Welcome messages can only be set in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the custom welcome message you want to set." },
                    { quoted: message }
                );
                return;
            }

            const customMsg = args.join(" ");

            // Save custom welcome message in DB
            await db.set(`welcomeMsg_${chatId}`, customMsg);

            const response = `
${getWelcomeMsgArt()}
🎉 *SETWELCOMEMSG COMMAND EXECUTED*
${getWelcomeMsgArt()}

✅ Custom welcome message has been set successfully.  
📌 New Message:  
"${customMsg}"

${getWelcomeMsgArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing setwelcomemsg command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running setwelcomemsg command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWelcomeMsgArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎉─────────────────🎉",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
