import axios from "axios";

export default {
    name: "flirt",
    description: "Get flirty pickup lines",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Use pickup line API
            const response = await axios.get(
                "https://pickup-line.vercel.app/api",
                {
                    timeout: 10000
                }
            );

            const flirtLine = response.data.line || response.data.pickupLine;
            
            const flirtMessage = `
😘 *FLIRTY PICKUP LINE* 😘

${flirtLine}

💕 Use it wisely! 😉
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: flirtMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing flirt command:', error);
            
            // Fallback flirt lines
            const fallbackFlirts = [
                "Are you a magician? Because whenever I look at you, everyone else disappears!",
                "Do you have a map? I keep getting lost in your eyes!",
                "Is your name Google? Because you have everything I've been searching for!",
                "Are you made of copper and tellurium? Because you're Cu-Te!",
                "If you were a vegetable, you'd be a cute-cumber!",
                "Do you believe in love at first sight, or should I walk by again?",
                "Is there an airport nearby or is it my heart taking off?",
                "You must be a campfire, because you're hot and I want s'more!"
            ];
            
            const randomFlirt = fallbackFlirts[Math.floor(Math.random() * fallbackFlirts.length)];
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `😘 *FLIRTY PICKUP LINE*\n\n${randomFlirt}\n\n💕 Use it wisely! 😉`,
                },
                { quoted: message }
            );
        }
    },
};