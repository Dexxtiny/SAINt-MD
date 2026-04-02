import logger from "../utils/logger.js";

export default {
    name: "welcome",
    description: "Enable or disable welcome messages when members join",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (!chatId.endsWith("@g.us")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Welcome messages can only be enabled in group chats." },
                    { quoted: message }
                );
                return;
            }

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please specify `on` or `off` to enable/disable welcome messages." },
                    { quoted: message }
                );
                return;
            }

            const option = args[0].toLowerCase();
            if (option !== "on" && option !== "off") {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid option. Use `welcome on` or `welcome off`." },
                    { quoted: message }
                );
                return;
            }

            // Save Welcome setting in DB
            await db.set(`welcome_${chatId}`, option === "on");

            const response = `
${getWelcomeArt()}
🎉 *WELCOME COMMAND EXECUTED*
${getWelcomeArt()}

✅ Welcome messages have been turned *${option.toUpperCase()}* for this group.  
⚡ New members will now be ${option === "on" ? "greeted with a welcome message" : "ignored"}.

${getWelcomeArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing welcome command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running welcome command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWelcomeArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎉─────────────────🎉",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
