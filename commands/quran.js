import logger from "../utils/logger.js";
import axios from "axios";

export default {
    name: "quran",
    description: "Fetch Qur’an verses by surah and ayah",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a Qur’an reference (e.g., Al-Fatiha 1)." },
                    { quoted: message }
                );
                return;
            }

            const reference = args.join(" ");

            // Example API call (replace with your preferred Qur’an API)
            // Here we use api.alquran.cloud for demonstration
            const [surah, ayah] = reference.split(" ");
            const apiUrl = `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`;
            const { data } = await axios.get(apiUrl);

            if (!data || !data.data || !data.data.text) {
                await client.sendMessage(
                    chatId,
                    { text: `⚠️ Could not find verse for: ${reference}` },
                    { quoted: message }
                );
                return;
            }

            const verseText = data.data.text;
            const verseRef = `${data.data.surah.englishName} ${data.data.numberInSurah}`;

            const response = `
${getQuranArt()}
🕌 *QUR’AN VERSE*
${getQuranArt()}

🔹 Reference: *${verseRef}*  
🔹 Verse: ${verseText}

${getQuranArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing quran command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running quran command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getQuranArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🕌─────────────────🕌",
        "⊱──────── ☪️ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
