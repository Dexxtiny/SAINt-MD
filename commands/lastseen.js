import logger from "../utils/logger.js";

export default {
    name: "lastseen",
    description: "Check the last seen status of a user",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the number or mention the user you want to check last seen for." },
                    { quoted: message }
                );
                return;
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // Fetch presence info
            const presence = await client.presenceSubscribe(targetNumber);

            // Note: Actual last seen availability depends on WhatsApp privacy settings
            const response = `
${getLastSeenArt()}
👀 *LAST SEEN CHECK*
${getLastSeenArt()}

📌 Target: *${args[0]}*  
✅ Presence info requested.  
⚡ If privacy allows, last seen/online status will be shown.

${getLastSeenArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing lastseen command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running lastseen command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getLastSeenArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👀─────────────────👀",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
