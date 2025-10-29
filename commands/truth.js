
import axios from "axios";

export default {
    name: "truth",
    description: "Get random truth questions from API",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get truth question from Truth or Dare API
            const response = await axios.get(
                "https://api.truthordarebot.xyz/v1/truth",
                {
                    timeout: 10000
                }
            );

            const truth = response.data;
            
            const truthMessage = `
${getTruthArt()}

🤔 *TRUTH QUESTION* 🤔

${truth.question}

📊 Rating: ${truth.rating}
🎪 Type: ${truth.type}

💬 Answer honestly! No lying allowed!
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: truthMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing truth command:', error);
            
            // Fallback truths if API fails
            const fallbackTruths = [
                "What's your most embarrassing childhood memory?",
                "Have you ever pretended to be sick to get out of something?",
                "What's the biggest lie you've ever told?",
                "What's your guilty pleasure that you're ashamed of?",
                "Have you ever had a crush on a friend's partner?",
                "What's the most trouble you've ever been in?"
            ];
            
            const randomTruth = fallbackTruths[Math.floor(Math.random() * fallbackTruths.length)];
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `🤔 *TRUTH QUESTION*\n\n${randomTruth}\n\n💬 Answer honestly!`,
                },
                { quoted: message }
            );
        }
    },
};

// ASCII art for truth
function getTruthArt() {
    const arts = [
        "🤔 ━━━━━━━━━━━━━━━━━ 🤔",
        "💎 ⋅⋅⋅⋅ TRUTH ⋅⋅⋅⋅ 💎",
        "🌟 ─────────────────── 🌟"
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
