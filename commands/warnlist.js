import logger from "../utils/logger.js";

export default {
    name: "warnlist",
    description: "Show all warnings issued in this group",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ WarnList can only be used in group chats." },
                    { quoted: message }
                );
                return;
            }

            // Fetch warnings from database
            const warns = await db.get(`warns_${chatId}`) || [];

            if (warns.length === 0) {
                await client.sendMessage(
                    chatId,
                    { text: "✅ No warnings have been issued in this group." },
                    { quoted: message }
                );
                return;
            }

            // Count warnings per user
            const warnCounts = {};
            warns.forEach(w => {
                warnCounts[w.user] = (warnCounts[w.user] || 0) + 1;
            });

            const warnList = Object.entries(warnCounts)
                .map(([user, count], index) => `🔹 ${index + 1}. ${user} → ${count} warning(s)`)
                .join("\n");

            const response = `
${getWarnListArt()}
⚠️ *WARNLIST COMMAND EXECUTED*
${getWarnListArt()}

${warnList}

⚡ Total warnings issued: *${warns.length}*

${getWarnListArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing warnlist command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running warnlist command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWarnListArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚠️─────────────────⚠️",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
