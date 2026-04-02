import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "tiktokstalk",
    description: "Fetch TikTok profile details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a TikTok username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Example API endpoint (replace with a real TikTok scraper API)
            const res = await fetch(`https://api.popcat.xyz/tiktok?user=${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for TikTok user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getTikTokArt()}
🎵 *TIKTOKSTALK COMMAND EXECUTED*
${getTikTokArt()}

👤 Username: *${data.username}*  
📝 Name: *${data.nickname || "N/A"}*  
👥 Followers: *${data.followers}*  
👥 Following: *${data.following}*  
❤️ Likes: *${data.likes}*  
🎬 Videos: *${data.videos}*  
📝 Bio: ${data.bio || "No bio set"}  
🔗 Profile: https://www.tiktok.com/@${data.username}

${getTikTokArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing tiktokstalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running tiktokstalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getTikTokArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎵─────────────────🎵",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
