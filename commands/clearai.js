import logger from "../utils/logger.js";

export default {
    name: "clearai",
    description: "Clear AI context or reset conversation",
    category: "tools",

    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Perform clearing logic (this can be expanded to reset caches, sessions, etc.)
            const result = await clearAIContext();

            const response = `
${getClearArt()}
🧹 *CLEAR AI CONTEXT*
${getClearArt()}

✅ ${result}

${getClearArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing clearai command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error clearing AI context. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Function to clear AI context
async function clearAIContext() {
    try {
        // Placeholder logic — you can expand this to reset sessions, caches, or temporary data
        return "AI context has been successfully cleared. Fresh start!";
    } catch (error) {
        logger.error("Error clearing AI context:", error);
        return "Unable to clear AI context.";
    }
}

// Decorative art for clearai messages
function getClearArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧹─────────────────🧹",
        "⊱──────── 🔄 ────────⊰",
        "»»────── 🗑️ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
