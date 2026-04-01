import logger from "../utils/logger.js";

export default {
    name: "interviewans",
    description: "Generate multiple professional answers to interview questions",
    category: "career",

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
                        text: `💼 *INTERVIEWANS COMMAND*\n\nUsage:\n• interviewans [question]\n• Reply to any message with: interviewans\n\nExamples:\n• interviewans Tell me about yourself\n• interviewans Why should we hire you?\n• interviewans What are your strengths and weaknesses?`,
                    },
                    { quoted: message }
                );
                return;
            }

            const question = args.join(" ") || quotedText;

            if (!question) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ No interview question provided. Please add a question or reply to a message with: interviewans",
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate multiple interview answers
            const results = await generateInterviewAnswers(question);

            const response = `
${getInterviewArt()}
💼 *INTERVIEW ANSWERS*
${getInterviewArt()}

❓ *Question:* ${question}

✅ *Suggested Answers:*  
1️⃣ ${results[0]}  

2️⃣ ${results[1]}  

3️⃣ ${results[2]}  

${getInterviewArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing interviewans command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating interview answers. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Multiple interview answer generator
async function generateInterviewAnswers(question) {
    try {
        if (/tell me about yourself/i.test(question)) {
            return [
                "I am a motivated professional with experience in [your field]. I enjoy solving problems and contributing to meaningful projects.",
                "My background includes [specific skills], and I’m passionate about continuous learning and growth.",
                "I bring a mix of technical expertise and interpersonal skills, which helps me collaborate effectively and deliver results."
            ];
        } else if (/strengths/i.test(question)) {
            return [
                "I am adaptable and thrive in dynamic environments.",
                "My strengths include problem-solving and clear communication.",
                "I excel at teamwork and staying focused under pressure."
            ];
        } else if (/weaknesses/i.test(question)) {
            return [
                "I sometimes take on too much responsibility, but I’m learning to delegate more effectively.",
                "I can be detail-oriented to a fault, but I’ve learned to balance precision with efficiency.",
                "Public speaking used to be a challenge, but I’ve been improving through practice and training."
            ];
        } else if (/hire you/i.test(question)) {
            return [
                "I align well with your company’s mission and can contribute immediately with my skills.",
                "I bring enthusiasm, dedication, and proven results that match the role requirements.",
                "I’m committed to growth and teamwork, ensuring I add long-term value to your organization."
            ];
        } else {
            return [
                `For "${question}", structure your answer clearly and connect it to the role.`,
                `Show confidence and authenticity when answering "${question}".`,
                `Highlight relevant experiences and explain how they prepare you for "${question}".`
            ];
        }
    } catch (error) {
        logger.error("Error generating interview answers:", error);
        return ["Unable to generate answer.", "Unable to generate answer.", "Unable to generate answer."];
    }
}

// Decorative art for interviewans messages
function getInterviewArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💼─────────────────💼",
        "⊱──────── ✅ ────────⊰",
        "»»────── 🎤 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
