import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "npmstalk",
    description: "Fetch npm package details",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide an npm package name." },
                    { quoted: message }
                );
                return;
            }

            const pkg = args[0];

            // Fetch npm package data
            const res = await fetch(`https://registry.npmjs.org/${pkg}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for npm package *${pkg}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();
            const latestVersion = data["dist-tags"]?.latest || "N/A";
            const latestInfo = data.versions?.[latestVersion] || {};

            const response = `
${getNpmStalkArt()}
📦 *NPMSTALK COMMAND EXECUTED*
${getNpmStalkArt()}

📌 Package: *${data.name}*  
📝 Description: ${latestInfo.description || "No description"}  
📥 Latest Version: *${latestVersion}*  
👤 Author: ${latestInfo.author?.name || "Unknown"}  
🔗 Homepage: ${latestInfo.homepage || "N/A"}  
📦 NPM Link: https://www.npmjs.com/package/${pkg}

${getNpmStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing npmstalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running npmstalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getNpmStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📦─────────────────📦",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
