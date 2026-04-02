import logger from "../utils/logger.js";

export default {
    name: "antiflood",
    description: "Enable or disable AntiFlood protection in groups",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ AntiFlood can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable AntiFlood." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `antiflood on` or `antiflood off`." },
                    { quoted: message }
                );
                return;
            }

            // Save AntiFlood setting in DB
            await db.set(`antiflood_${chatId}`, option === "on");

            const response = `
${getFloodArt()}
🌊 *ANTIFLOOD COMMAND EXECUTED*
${getFloodArt()}

✅ AntiFlood has been turned *${option.toUpperCase()}* for this group.  
⚡ Flooding/spam messages will now be ${option === "on" ? "detected and blocked automatically" : "ignored"}.

${getFloodArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing antiflood command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running antiflood command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getFloodArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌊─────────────────🌊",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
