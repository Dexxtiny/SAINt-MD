import logger from "../utils/logger.js";

export default {
    name: "github",
    description: "Generate categorized GitHub project messages (Overview, Commits, Stars, Issues)",
    category: "information",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const repo = args.join(" ") || quotedText || "Unknown Repository";

            if (!repo) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🐙 *GITHUB COMMAND*\n\nUsage:\n• github [repository/project]\n• Reply to any message with: github\n\nExamples:\n• github SAINt-MD\n• github my-awesome-project\n• github portfolio-site`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized GitHub info
            const results = await generateGithub(repo);

            const response = `
${getGithubArt()}
🐙 *GITHUB PROJECT*
${getGithubArt()}

📝 *Repository:* ${repo}

💡 *Overview:*  
${results.overview}

💡 *Commits:*  
${results.commits}

💡 *Stars:*  
${results.stars}

💡 *Issues:*  
${results.issues}

${getGithubArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing github command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating GitHub message. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized GitHub info generator
async function generateGithub(repo) {
    try {
        const overview = `📖 ${repo} is a GitHub repository containing source code and documentation.`;
        const commits = `📌 Recent commits show active development in ${repo}.`;
        const stars = `⭐ ${repo} has gained community recognition with stars.`;
        const issues = `🐞 ${repo} tracks bugs and feature requests via issues.`;

        return { overview, commits, stars, issues };
    } catch (error) {
        logger.error("Error generating GitHub info:", error);
        return { overview: "Unable to generate.", commits: "Unable to generate.", stars: "Unable to generate.", issues: "Unable to generate." };
    }
}

// Decorative art for GitHub messages
function getGithubArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🐙─────────────────🐙",
        "⊱──────── 💡 ────────⊰",
        "»»────── ⭐ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
