import logger from "../utils/logger.js";

export default {
    name: "vv",
    description: "Resend view-once media so it can be viewed again",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Check if message contains view-once media
            if (!message.message?.viewOnceMessage) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ No view-once media detected in this message." },
                    { quoted: message }
                );
                return;
            }

            // Extract the actual media from viewOnceMessage
            const mediaMessage = message.message.viewOnceMessage.message;

            // Resend the media back to chat
            await client.sendMessage(chatId, mediaMessage, { quoted: message });

            const response = `
${getVVArt()}
👁 *VV COMMAND EXECUTED*
${getVVArt()}

✅ View-once media has been resent.  
⚡ You can now view it again without restriction.

${getVVArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing vv command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running vv command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getVVArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👁─────────────────👁",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
