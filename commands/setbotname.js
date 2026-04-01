import logger from "../utils/logger.js";

export default {
    name: "setbotname",
    description: "Set a new display name for the bot",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a new name for the bot." },
                    { quoted: message }
                );
                return;
            }

            const newName = args.join(" ");

            // Save new bot name in DB
            db.setConfig("botName", newName);

            const response = `
${getNameArt()}
📝 *SETBOTNAME SUCCESSFUL*
${getNameArt()}

✅ Bot name has been updated.  
📌 New name: *${newName}*  
⚡ Active until changed again.

${getNameArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setbotname command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setbotname command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getNameArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
