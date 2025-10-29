import axios from "axios";

export default {
    name: "compliment",
    description: "Get sweet compliments",
    category: "fun",
    
    async execute(message, client, args) {
        try {
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Use compliment API
            const response = await axios.get(
                "https://complimentr.com/api",
                {
                    timeout: 10000
                }
            );

            const compliment = response.data.compliment;
            
            const complimentMessage = `
💝 *SWEET COMPLIMENT* 💝

${compliment}

✨ You're amazing! Remember that!
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: complimentMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing compliment command:', error);
            
            // Fallback compliments
            const fallbackCompliments = [
                "You have the most beautiful smile!",
                "Your positivity is infectious!",
                "You light up every room you enter!",
                "You're an incredible friend!",
                "Your perspective is refreshing!",
                "You're like sunshine on a rainy day!",
                "You bring out the best in people!",
                "You're one of a kind and absolutely wonderful!"
            ];
            
            const randomCompliment = fallbackCompliments[Math.floor(Math.random() * fallbackCompliments.length)];
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: `💝 *SWEET COMPLIMENT*\n\n${randomCompliment}\n\n✨ You're amazing!`,
                },
                { quoted: message }
            );
        }
    },
};