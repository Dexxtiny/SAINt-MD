import logger from "../utils/logger.js";

export default {
    name: "listwarn",
    description: "Show all users who have warnings",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Fetch warned users from database
            const warnedUsers = await db.get("warnedUsers") || [];

            if (warnedUsers.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "✅ No users currently have warnings." },
                    { quoted: message }
                );
                return;
            }

            const warnList = warnedUsers
                .map((user, index) => `🔹 ${index + 1}. ${user.number} — ${user.count} warning(s)`)
                .join("\n");

            const response = `
${getWarnArt()}
⚠️ *WARNED USERS LIST*
${getWarnArt()}

${warnList}

⚡ Total warned: *${warnedUsers.length}*

${getWarnArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing listwarn command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running listwarn command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWarnArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚠️─────────────────⚠️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
