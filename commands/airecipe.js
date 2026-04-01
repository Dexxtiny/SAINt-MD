import axios from "axios";
import logger from "../utils/logger.js";

export default {
    name: "airecipe",
    description: "Generate a detailed AI recipe for any dish or ingredients you have",
    category: "food",

    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "🍳 *AI RECIPE GENERATOR*\n\nUsage: airecipe [dish or ingredients]\n\nExamples:\n• airecipe jollof rice\n• airecipe chocolate cake\n• airecipe chicken, tomatoes, onions\n• airecipe vegan pasta\n• airecipe easy Nigerian breakfast",
                    },
                    { quoted: message }
                );
                return;
            }

            const query = args.join(" ");

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate recipe using OpenAI
            const recipe = await generateRecipe(query);

            if (!recipe) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: "❌ Could not generate a recipe for: " + query + "\n\nTry a different dish or ingredient list.",
                    },
                    { quoted: message }
                );
                return;
            }

            const response = `
${getRecipeArt()}
🍽️ *${recipe.name.toUpperCase()}*
${getRecipeArt()}

⏱️ *Prep:* ${recipe.prepTime}  |  🔥 *Cook:* ${recipe.cookTime}
👥 *Serves:* ${recipe.serves}  |  📊 *Difficulty:* ${recipe.difficulty}

🛒 *INGREDIENTS:*
${recipe.ingredients}

👨‍🍳 *INSTRUCTIONS:*
${recipe.instructions}

${recipe.tips ? `💡 *TIPS:*\n${recipe.tips}\n` : ""}
${getRecipeArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing airecipe command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating recipe. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Generate recipe using OpenAI API
async function generateRecipe(query) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            logger.error("OPENAI_API_KEY is not set in environment variables");
            return null;
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `You are a professional chef and recipe writer. 
When given a dish name or ingredients, respond ONLY with a JSON object in this exact format, no extra text:
{
  "name": "Recipe Name",
  "prepTime": "X mins",
  "cookTime": "X mins",
  "serves": "X people",
  "difficulty": "Easy | Medium | Hard",
  "ingredients": "• ingredient 1\\n• ingredient 2\\n• ingredient 3",
  "instructions": "1. Step one\\n2. Step two\\n3. Step three",
  "tips": "Optional tip here or empty string"
}
Keep ingredients under 12 items. Keep instructions under 10 steps. Make it practical and clear for a home cook.`,
                    },
                    {
                        role: "user",
                        content: `Generate a recipe for: ${query}`,
                    },
                ],
                max_tokens: 700,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 20000,
            }
        );

        const content = response.data.choices?.[0]?.message?.content?.trim();
        if (!content) return null;

        // Safely parse JSON response
        const clean = content.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        // Validate required fields
        if (!parsed.name || !parsed.ingredients || !parsed.instructions) return null;

        return {
            name: parsed.name || query,
            prepTime: parsed.prepTime || "N/A",
            cookTime: parsed.cookTime || "N/A",
            serves: parsed.serves || "2-4",
            difficulty: parsed.difficulty || "Medium",
            ingredients: parsed.ingredients,
            instructions: parsed.instructions,
            tips: parsed.tips || "",
        };

    } catch (error) {
        logger.error("Error calling OpenAI API for recipe:", error);
        return null;
    }
}

// Decorative art for recipe messages
function getRecipeArt() {
    const arts = [
        "🍴·─────────────────·🍴",
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌿────────────────🌿",
        "⊱──────── 🍽️ ────────⊰",
        "»»── 🔪 ──────────── 🔪 ──««",
    ];

    return arts[Math.floor(Math.random() * arts.length)];
}
