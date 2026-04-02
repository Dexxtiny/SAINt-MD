import logger from "../utils/logger.js";

export default {
    name: "channelmute",
    description: "Mute notifications for a WhatsApp channel",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel ID.\nExample: channelmute channel_12345" },
                    { quoted: message }
                );
                return;
            }

            const channelId = args[0];

            // Fetch channel info from DB
            const channel = await db.get(channelId);
            if (!channel) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Channel with ID *${channelId}* not found.` },
                    { quoted: message }
                );
                return;
            }

            // Update mute status
            channel.muted = true;
            await db.set(channelId, channel);

            const response = `
${getChannelMuteArt()}
🔇 *CHANNELMUTE COMMAND EXECUTED*
${getChannelMuteArt()}

✅ Channel muted successfully!  
📌 Channel Name: *${channel.name}*  
🆔 Channel ID: ${channelId}  
🔕 Notifications: Muted  
👤 Action By: ${message.pushName || "Unknown"}  

${getChannelMuteArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channelmute command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channelmute command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelMuteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔇─────────────────🔇",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
