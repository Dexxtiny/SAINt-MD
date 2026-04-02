import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "snapstalk",
    description: "Fetch Snapchat profile details for a user",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a Snapchat username." },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];

            // Example API endpoint (replace with a real Snapchat scraper API)
            const res = await fetch(`https://api.popcat.xyz/snapchat?user=${username}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for Snapchat user *${username}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getSnapStalkArt()}
👻 *SNAPSTALK COMMAND EXECUTED*
${getSnapStalkArt()}

👤 Username: *${data.username}*  
📝 Display Name: *${data.display_name || "N/A"}*  
👥 Followers: *${data.followers || "N/A"}*  
📝 Bio: ${data.bio || "No bio set"}  
🔗 Profile: https://www.snapchat.com/add/${data.username}

${getSnapStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing snapstalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running snapstalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getSnapStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👻─────────────────👻",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
