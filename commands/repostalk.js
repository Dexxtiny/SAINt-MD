import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "repostalk",
    description: "Fetch GitHub repository details",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 2) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the GitHub username and repository name.\nExample: repostalk torvalds linux" },
                    { quoted: message }
                );
                return;
            }

            const username = args[0];
            const repo = args[1];

            // Fetch GitHub repository data
            const res = await fetch(`https://api.github.com/repos/${username}/${repo}`);
            if (!res.ok) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not fetch data for repository *${username}/${repo}*.` },
                    { quoted: message }
                );
                return;
            }

            const data = await res.json();

            const response = `
${getRepoStalkArt()}
📂 *REPOSTALK COMMAND EXECUTED*
${getRepoStalkArt()}

📌 Repository: *${data.full_name}*  
📝 Description: ${data.description || "No description"}  
⭐ Stars: *${data.stargazers_count}*  
🍴 Forks: *${data.forks_count}*  
🐛 Open Issues: *${data.open_issues_count}*  
📥 Default Branch: *${data.default_branch}*  
🔗 Repo Link: ${data.html_url}

${getRepoStalkArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing repostalk command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running repostalk command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getRepoStalkArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📂─────────────────📂",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
