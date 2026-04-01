import logger from "../utils/logger.js";

export default {
    name: "antibadword",
    description: "Detect and block bad words in group chats",
    category: "moderation",

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

            const badWords = ["idiot", "stupid", "fool", "nonsense"]; // customize your bad word list
            const text =
                message.message?.conversation ||
                message.message?.extendedTextMessage?.text ||
                "";

            const found = badWords.find(word =>
                text.toLowerCase().includes(word.toLowerCase())
            );

            if (found) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `🚫 *ANTIBADWORD ALERT*\n\n❌ Detected bad word: "${found}"\n⚠️ Please keep the chat respectful.`,
                    },
                    { quoted: message }
                );

                // Optionally delete the offending message if supported
                try {
                    await client.sendMessage(groupId, {
                        delete: message.key
                    });
                } catch (err) {
                    logger.warn("Unable to delete message:", err);
                }
            }
        } catch (error) {
            logger.error("Error executing antibadword command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running antibadword filter. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};
