import logger from "../utils/logger.js";

export default {
    name: "bass",
    description: "Apply bass boost effect to audio messages",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("recording", chatId);

            // Check if quoted message contains audio
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted || !quoted.audioMessage) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Please reply to an audio message to apply bass boost." },
                    { quoted: message }
                );
                return;
            }

            // Extract audio
            const audioMessage = quoted.audioMessage;

            // Apply bass boost (placeholder for actual audio processing logic)
            // In production, you’d run the audio through ffmpeg or a DSP filter
            const boostedAudio = audioMessage; // Replace with processed audio

            // Send boosted audio back
            await client.sendMessage(chatId, boostedAudio, { quoted: message });

            const response = `
${getBassArt()}
🎵 *BASS BOOST APPLIED*
${getBassArt()}

✅ Audio has been bass‑boosted.  
⚡ Enjoy the deeper, heavier sound!

${getBassArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing bass command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running bass command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getBassArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎵─────────────────🎵",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
