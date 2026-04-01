import logger from "../utils/logger.js";

export default {
    name: "setownername",
    description: "Set a new display name for the bot owner",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a new name for the owner." },
                    { quoted: message }
                );
                return;
            }

            const newOwnerName = args.join(" ");

            // Save new owner name in DB
            db.setConfig("ownerName", newOwnerName);

            const response = `
${getOwnerArt()}
👑 *SETOWNERNAME SUCCESSFUL*
${getOwnerArt()}

✅ Owner name has been updated.  
📌 New owner name: *${newOwnerName}*  
⚡ Active until changed again.

${getOwnerArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing setownername command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running setownername command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getOwnerArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👑─────────────────👑",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
