import logger from "../utils/logger.js";

export default {
    name: "autobio",
    description: "Enable automatic bio updates for the bot",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable AutoBio mode in DB
            db.setConfig("autoBio", true);

            // Custom bio message from args or default
            const customBio = args.length > 0 
                ? args.join(" ") 
                : "⚡ SAINt-MD is always online ✨";

            // Update bot bio/status
            await client.updateProfileStatus(customBio);

            const response = `
${getBioArt()}
✨ *AUTOBIO MODE ENABLED*
${getBioArt()}

✅ Bot bio/status will now auto-update.  
📌 Current Bio:  
"${customBio}"

⚡ Active until disabled.
${getBioArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing autobio command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running autobio command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getBioArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "✨─────────────────✨",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
