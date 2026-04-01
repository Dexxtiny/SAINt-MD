import logger from "../utils/logger.js";

export default {
    name: "autoreact",
    description: "Enable automatic emoji reactions to messages",
    category: "fun",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AutoReact mode in DB
            db.setConfig("autoReact", true);

            // Default emoji list or custom from args
            const emojis = args.length > 0 
                ? args 
                : ["👍", "❤️", "😂", "🔥", "😎", "✨"];

            // Save emojis to DB
            db.setConfig("autoReactEmojis", emojis);

            const response = `
${getReactArt()}
😀 *AUTOREACT MODE ENABLED*
${getReactArt()}

✅ Bot will now auto-react to messages.  
📌 Emojis in use: ${emojis.join(" ")}  
⚡ Active until disabled.

${getReactArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autoreact command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autoreact command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getReactArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "😀─────────────────😀",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
