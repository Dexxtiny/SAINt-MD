import logger from "../utils/logger.js";

export default {
    name: "clearwarn",
    description: "Clear warnings for a specific user",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the number or mention the user whose warnings you want to clear." },
                    { quoted: message }
                );
                return;
            }

            const targetNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            // Fetch existing warnings
            let warns = await db.get(`warns_${chatId}`) || [];

            // Filter out warnings for this user
            const newWarns = warns.filter(w => w.user !== targetNumber);

            await db.set(`warns_${chatId}`, newWarns);

            const response = `
${getClearWarnArt()}
🧹 *CLEARWARN COMMAND EXECUTED*
${getClearWarnArt()}

✅ Warnings cleared successfully.  
📌 Target: *${args[0]}*  
⚡ Remaining warnings in group: *${newWarns.length}*

${getClearWarnArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing clearwarn command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running clearwarn command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getClearWarnArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🧹─────────────────🧹",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
