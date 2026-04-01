import logger from "../utils/logger.js";

export default {
    name: "funfact",
    description: "Share a random fun fact",
    category: "fun",

    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate fun fact
            const result = await getFunFact();

            const response = `
${getFunFactArt()}
🎉 *FUN FACT*
${getFunFactArt()}

💡 ${result}

${getFunFactArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing funfact command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating fun fact. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Fun fact generator
async function getFunFact() {
    try {
        const facts = [
            "Bananas are berries, but strawberries are not.",
            "Octopuses have three hearts and blue blood.",
            "Sharks existed before trees.",
            "Honey never spoils — archaeologists found edible honey in ancient tombs.",
            "A day on Venus is longer than a year on Venus.",
            "Sloths can hold their breath longer than dolphins.",
            "The Eiffel Tower can grow taller in summer due to heat expansion."
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    } catch (error) {
        logger.error("Error generating fun fact:", error);
        return "Unable to generate fun fact.";
    }
}

// Decorative art for funfact messages
function getFunFactArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🎉─────────────────🎉",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🌍 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
