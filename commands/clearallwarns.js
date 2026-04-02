import logger from "../utils/logger.js";

export default {
    name: "clearallwarns",
    description: "Clear all warnings for this group or globally",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            // Check if group or private chat
            const scope = chatId.endsWith("@g.us") ? `warns_${chatId}` : "warns_global";

            // Clear warnings
            await db.set(scope, []);

            const response = `
${getClearWarnsArt()}
🧹 *CLEARALLWARNS COMMAND EXECUTED*
${getClearWarnsArt()}

✅ All warnings have been cleared successfully.  
⚡ Scope: *${chatId.endsWith("@g.us") ? "This Group" : "Global"}*

${getClearWarnsArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing clearallwarns command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running clearallwarns command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getClearWarnsArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧹─────────────────🧹",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
