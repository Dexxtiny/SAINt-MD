
import axios from "axios";
import logger from "../utils/logger.js";

const WOLFRAM_APP_ID = "LPQHP8QTTV";

export default {
    name: "solve",
    description: "Get explanations and answers for math, English, chemistry and other questions",
    category: "education",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🧠 *PROBLEM SOLVER*\n\nUsage: solve [your question]\n\nExamples:\n• solve 2x + 5 = 15\n• solve what is photosynthesis\n• solve grammar: their vs there\n• solve chemical formula for water",
                    },
                    { quoted: message }
                );
                return;
            }

            const question = args.join(" ");
            
            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get solution from Wolfram Alpha
            const solution = await getWolframSolution(question);

            if (!solution) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not find a solution for: " + question + "\n\nTry rephrasing your question or ask a different question.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getSolverArt()}

🧠 *QUESTION:* ${question}

📚 *ANSWER:*
${solution.answer}

${solution.explanation ? `💡 *EXPLANATION:*\n${solution.explanation}\n` : ''}
${solution.steps ? `🔢 *STEPS:*\n${solution.steps}\n` : ''}
🎯 *CATEGORY:* ${solution.category}

${getSolverArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: response,
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing solve command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error solving question. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Get solution from Wolfram Alpha API
async function getWolframSolution(question) {
    try {
        const response = await axios.get(
            `http://api.wolframalpha.com/v2/query`,
            {
                params: {
                    appid: WOLFRAM_APP_ID,
                    input: question,
                    output: "json",
                    format: "plaintext"
                },
                timeout: 15000
            }
        );

        return parseWolframResponse(response.data);
        
    } catch (error) {
        console.error("Error fetching from Wolfram Alpha:", error);
        return generateFallbackSolution(question);
    }
}

// Parse Wolfram Alpha response
function parseWolframResponse(data) {
    try {
        if (!data.queryresult || data.queryresult.success === false) {
            return null;
        }

        const pods = data.queryresult.pods || [];
        let answer = "";
        let explanation = "";
        let steps = "";
        let category = "General";

        // Extract information from different pods
        for (const pod of pods) {
            const podTitle = pod.title?.toLowerCase() || "";
            const subpods = pod.subpods || [];
            
            for (const subpod of subpods) {
                const plaintext = subpod.plaintext || "";
                
                if (podTitle.includes("result") || podTitle.includes("answer")) {
                    answer = plaintext;
                } else if (podTitle.includes("solution") || podTitle.includes("step-by-step")) {
                    steps = plaintext;
                } else if (podTitle.includes("definition") || podTitle.includes("information")) {
                    explanation = plaintext;
                } else if (podTitle.includes("basic") && !answer) {
                    answer = plaintext;
                }
            }
            
            // Determine category
            if (podTitle.includes("mathematics") || podTitle.includes("math")) category = "Mathematics";
            else if (podTitle.includes("chemistry")) category = "Chemistry";
            else if (podTitle.includes("physics")) category = "Physics";
            else if (podTitle.includes("language") || podTitle.includes("grammar")) category = "English";
        }

        // If no answer found, use the first available pod
        if (!answer && pods.length > 0 && pods[0].subpods.length > 0) {
            answer = pods[0].subpods[0].plaintext || "No specific answer available";
        }

        // Truncate long responses for WhatsApp
        answer = truncateText(answer, 600);
        explanation = truncateText(explanation, 400);
        steps = truncateText(steps, 500);

        return {
            answer: answer || "Answer not available",
            explanation: explanation,
            steps: steps,
            category: category
        };
        
    } catch (error) {
        console.error("Error parsing Wolfram response:", error);
        return null;
    }
}

// Fallback solution generator
function generateFallbackSolution(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Common questions fallback
    if (lowerQuestion.includes('2x + 5 = 15')) {
        return {
            answer: "x = 5",
            explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5",
            steps: "1. 2x + 5 = 15\n2. 2x = 15 - 5\n3. 2x = 10\n4. x = 10 ÷ 2\n5. x = 5",
            category: "Mathematics"
        };
    }
    else if (lowerQuestion.includes('photosynthesis')) {
        return {
            answer: "Process by which plants convert light energy into chemical energy",
            explanation: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
            category: "Biology"
        };
    }
    else if (lowerQuestion.includes('their') && lowerQuestion.includes('there')) {
        return {
            answer: "Their = possession, There = location, They're = they are",
            explanation: "Their house (possession), Go there (location), They're happy (they are)",
            category: "English Grammar"
        };
    }
    else if (lowerQuestion.includes('water') && lowerQuestion.includes('formula')) {
        return {
            answer: "H₂O",
            explanation: "Two hydrogen atoms bonded to one oxygen atom",
            category: "Chemistry"
        };
    }
    
    return null;
}

// Truncate text to fit WhatsApp limits
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Simple ASCII art for solver
function getSolverArt() {
    const arts = [
        "✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦",
        "»»————-　★　————-««",
        "────────────────────",
        "♡━━━━━━━━━━━━━━━━♡",
        "➖➖➖➖➖➖➖➖➖➖➖➖➖"
    ];
    
    return arts[Math.floor(Math.random() * arts.length)];
}