import logger from "../utils/logger.js";

export default {
    name: "llama",
    description: "Generate llama-themed fun facts, jokes, and wisdom (single or mixed)",
    category: "fun",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🦙 *LLAMA COMMAND*\n\nUsage:\n• llama [mode]\n• Reply to any message with: llama\n\nAvailable modes: fact, joke, wisdom, mixed\n\nExamples:\n• llama fact\n• llama joke\n• llama wisdom\n• llama mixed`,
                    },
                    { quoted: message }
                );
                return;
            }

            const mode = args[0].toLowerCase() || quotedText;

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate llama response
            const result = await generateLlamaResponse(mode);

            const response = `
${getLlamaArt()}
🦙 *LLAMA MODE*
${getLlamaArt()}

🎨 *Mode:* ${mode}

💡 *Llama Says:*  
${Array.isArray(result) ? result.map((r, i) => `${i + 1}. ${r}`).join("\n") : result}

${getLlamaArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing llama command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating llama response. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Llama response generator with mixed mode
async function generateLlamaResponse(mode) {
    try {
        const facts = [
            "Llamas are social animals and live in herds.",
            "A llama can carry about 25–30% of its body weight.",
            "Llamas communicate by humming and body language.",
            "They’ve been domesticated in South America for thousands of years."
        ];

        const jokes = [
            "Why did the llama get invited to the party? Because he was a-fur-mative action!",
            "What do you call a very fast llama? A llam-speedster!",
            "Llamas don’t spit on friends… only on drama."
        ];

        const wisdom = [
            "Like a llama, carry only what you can handle — don’t overload yourself.",
            "Stay calm and fluffy; life’s drama isn’t worth the spit.",
            "Walk steadily, like a llama on a mountain path — balance is everything."
        ];

        switch (mode) {
            case "fact":
                return facts[Math.floor(Math.random() * facts.length)];
            case "joke":
                return jokes[Math.floor(Math.random() * jokes.length)];
            case "wisdom":
                return wisdom[Math.floor(Math.random() * wisdom.length)];
            case "mixed":
                return [
                    facts[Math.floor(Math.random() * facts.length)],
                    jokes[Math.floor(Math.random() * jokes.length)],
                    wisdom[Math.floor(Math.random() * wisdom.length)]
                ];
            default:
                return "Llama mode not recognized. Try: fact, joke, wisdom, or mixed.";
        }
    } catch (error) {
        logger.error("Error generating llama response:", error);
        return "Unable to generate llama response.";
    }
}

// Decorative art for llama messages
function getLlamaArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🦙─────────────────🦙",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🎉 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
