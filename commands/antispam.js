import logger from "../utils/logger.js";

export default {
    name: "antispam",
    description: "Enable or disable AntiSpam protection in groups",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ AntiSpam can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable AntiSpam." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `antispam on` or `antispam off`." },
                    { quoted: message }
                );
                return;
            }

            // Save AntiSpam setting in DB
            await db.set(`antispam_${chatId}`, option === "on");

            const response = `
${getAntiSpamArt()}
🛡 *ANTISPAM COMMAND EXECUTED*
${getAntiSpamArt()}

✅ AntiSpam has been turned *${option.toUpperCase()}* for this group.  
⚡ Spam messages will now be ${option === "on" ? "detected and blocked automatically" : "ignored"}.

${getAntiSpamArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing antispam command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running antispam command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getAntiSpamArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🛡─────────────────🛡",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
