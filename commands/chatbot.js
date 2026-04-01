import logger from "../utils/logger.js";

export default {
    name: "chatbot",
    description: "Enable chatbot mode for conversational replies",
    category: "fun",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable ChatBot mode in DB
            db.setConfig("chatBot", true);

            // Optional personality or style from args
            const style = args.length > 0 
                ? args.join(" ") 
                : "default friendly mode";

            const response = `
${getChatArt()}
💬 *CHATBOT MODE ENABLED*
${getChatArt()}

✅ Bot will now reply like a chatbot.  
📌 Style: ${style}  
⚡ Active until disabled.

${getChatArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing chatbot command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running chatbot command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getChatArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💬─────────────────💬",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
