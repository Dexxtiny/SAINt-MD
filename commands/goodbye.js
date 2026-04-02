import logger from "../utils/logger.js";

export default {
    name: "goodbye",
    description: "Enable or disable Goodbye messages when members leave",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Goodbye messages can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable Goodbye messages." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `goodbye on` or `goodbye off`." },
                    { quoted: message }
                );
                return;
            }

            // Save Goodbye setting in DB
            await db.set(`goodbye_${chatId}`, option === "on");

            const response = `
${getGoodbyeArt()}
👋 *GOODBYE COMMAND EXECUTED*
${getGoodbyeArt()}

✅ Goodbye messages have been turned *${option.toUpperCase()}* for this group.  
⚡ Members leaving will now be ${option === "on" ? "sent a farewell message" : "ignored"}.

${getGoodbyeArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing goodbye command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running goodbye command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getGoodbyeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "👋─────────────────👋",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
