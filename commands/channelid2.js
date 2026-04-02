import logger from "../utils/logger.js";

export default {
    name: "channelid2",
    description: "Fetch channel details using its ID",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a channel ID.\nExample: channelid2 channel_12345" },
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

            const response = `
${getChannelId2Art()}
🆔 *CHANNELID2 COMMAND EXECUTED*
${getChannelId2Art()}

📌 Channel Name: *${channel.name}*  
🆔 Channel ID: ${channelId}  
📝 Description: ${channel.description || "No description"}  
👤 Creator: ${channel.creator || "Unknown"}  
📅 Created At: ${channel.createdAt || "N/A"}

${getChannelId2Art()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing channelid2 command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running channelid2 command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getChannelId2Art() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🆔─────────────────🆔",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
