import logger from "../utils/logger.js";

export default {
    name: "addbadword",
    description: "Add a word to the bot's bad word filter list",
    category: "moderation",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide the word you want to add to the bad word list." },
                    { quoted: message }
                );
                return;
            }

            const badWord = args[0].toLowerCase();

            // Fetch existing bad words
            let badWords = await db.get("badWords") || [];

            if (badWords.includes(badWord)) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ The word *${badWord}* is already in the bad word list.` },
                    { quoted: message }
                );
                return;
            }

            // Add new bad word
            badWords.push(badWord);
            await db.set("badWords", badWords);

            const response = `
${getBadWordArt()}
🚫 *ADDBADWORD COMMAND EXECUTED*
${getBadWordArt()}

✅ Word added successfully.  
📌 New Bad Word: *${badWord}*  
⚡ Total bad words tracked: *${badWords.length}*

${getBadWordArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing addbadword command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running addbadword command. Please try again later." },
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
