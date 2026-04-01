import logger from "../utils/logger.js";

export default {
    name: "acronym",
    description: "Generate styled acronym breakdowns",
    category: "creative",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const phrase = args.join(" ") || quotedText || "UNKNOWN";

            if (!phrase || phrase.length < 2) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🔠 *ACRONYM COMMAND*\n\nUsage:\n• acronym [word or phrase]\n• Reply to any message with: acronym\n\nExamples:\n• acronym CODE\n• acronym DREAM\n• acronym AI`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            const breakdown = generateAcronym(phrase);

            const response = `
✦━━━━━━━━━━━━━━━━━✦
🔠 *ACRONYM BREAKDOWN*
✦━━━━━━━━━━━━━━━━━✦

📝 *Phrase:* ${phrase.toUpperCase()}

${breakdown}

✦━━━━━━━━━━━━━━━━━✦
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing acronym command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating acronym. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function generateAcronym(phrase) {
    const letters = phrase.toUpperCase().replace(/[^A-Z]/g, "").split("");
    const meanings = {
        A: "Advance",
        B: "Build",
        C: "Create",
        D: "Dream",
        E: "Explore",
        F: "Focus",
        G: "Grow",
        H: "Harness",
        I: "Innovate",
        J: "Jumpstart",
        K: "Keep",
        L: "Lead",
        M: "Master",
        N: "Navigate",
        O: "Optimize",
        P: "Push",
        Q: "Question",
        R: "Rise",
        S: "Solve",
        T: "Transform",
        U: "Unite",
        V: "Visualize",
        W: "Win",
        X: "Xplore",
        Y: "Yield",
        Z: "Zoom"
    };

    return letters.map(letter => `• ${letter} → ${meanings[letter] || "Unknown"}`).join("\n");
}
