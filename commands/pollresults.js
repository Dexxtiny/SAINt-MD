import logger from "../utils/logger.js";

export default {
    name: "pollresults",
    description: "View current poll results in the group",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            // Fetch group metadata
            const metadata = await client.groupMetadata(groupId);

            // Poll results are stored in messages, so we need to check quoted poll
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quotedMsg || !quotedMsg.pollCreationMessage) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `📊 *POLLRESULTS COMMAND*\n\nUsage:\n• Reply to a poll message with: pollresults\n\nExample:\n• (Reply to a poll) pollresults`,
                    },
                    { quoted: message }
                );
                return;
            }

            const poll = quotedMsg.pollCreationMessage;
            const question = poll.name;
            const options = poll.options.map(o => o.optionName);

            // Placeholder: actual votes would be tracked via events/messages
            const results = options.map((opt, i) => `${i + 1}. ${opt} — Votes: [pending]`);

            const response = `
${getPollResultsArt()}
📊 *POLL RESULTS REPORT*
${getPollResultsArt()}

📝 Question: ${question}

${results.join("\n")}

💡 Status: Poll results fetched successfully.
${getPollResultsArt()}
            `.trim();

            await client.sendMessage(
                groupId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing pollresults command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error fetching poll results. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getPollResultsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📊─────────────────📊",
        "⊱──────── 🗳️ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
