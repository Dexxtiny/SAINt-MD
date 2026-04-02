import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "igstalk",
    description: "Fetch Instagram profile details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide an Instagram username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Example API endpoint (replace with a real Instagram scraper API)
            const res = await fetch(`https://api.popcat.xyz/instagram?user=${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for Instagram user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getIgStalkArt()}
📸 *IGSTALK COMMAND EXECUTED*
${getIgStalkArt()}

👤 Username: *${data.username}*  
📝 Name: *${data.full_name || "N/A"}*  
👥 Followers: *${data.followers}*  
👥 Following: *${data.following}*  
📸 Posts: *${data.posts}*  
📝 Bio: ${data.biography || "No bio set"}  
🔗 Profile: https://instagram.com/${data.username}

${getIgStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing igstalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running igstalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getIgStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📸─────────────────📸",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
