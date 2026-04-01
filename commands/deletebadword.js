import logger from "../utils/logger.js";

export default {
    name: "deletebadword",
    description: "Enable automatic deletion of messages with bad words",
    category: "security",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;

            await client.sendPresenceUpdate("composing", chatId);

            // Enable DeleteBadWord mode in DB
            db.setConfig("deleteBadWord", true);

            // Optional: custom bad words list from args
            const badWords = args.length > 0 
                ? args.map(w => w.toLowerCase()) 
                : ["fuck", "shit", "bastard", "idiot"]; // default list

            db.setConfig("badWordsList", badWords);

            const response = `
${getBadWordArt()}
🚫 *DELETEBADWORD MODE ENABLED*
${getBadWordArt()}

✅ Messages containing banned words will now be auto-deleted.  
📌 Active word list: ${badWords.join(", ")}  
⚡ Protection active for this group.

${getBadWordArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing deletebadword command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running deletebadword command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getBadWordArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🚫─────────────────🚫",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
