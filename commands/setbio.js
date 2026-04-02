import logger from "../utils/logger.js";

export default {
    name: "setbio",
    description: "Set or update the bot's WhatsApp bio/status",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the new bio text." },
                    { quoted: message }
                );
                return;
            }

            const newBio = args.join(" ");

            // Update bio/status
            await client.updateProfileStatus(newBio);

            const response = `
${getBioArt()}
📝 *SETBIO COMMAND EXECUTED*
${getBioArt()}

✅ Bot bio has been updated successfully.  
📌 New Bio: *${newBio}*

${getBioArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing setbio command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running setbio command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getBioArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📝─────────────────📝",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
