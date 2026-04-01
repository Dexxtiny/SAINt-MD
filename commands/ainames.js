import axios from "axios";

export default {
  name: "ainames",
  description: "Generate AI-powered creative names based on your idea or criteria.",
  category: "tools",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text:
              "🏷️ *Usage:* ainames <describe your app/product/theme>\n\n_Example:_ ainames dog walking app"
          },
          { quoted: message }
        );
        return;
      }

      const input = args.join(" ");
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        await client.sendMessage(
          chatId,
          {
            text: "❌ OpenAI API key not found. Please add OPENAI_API_KEY to your .env file."
          },
          { quoted: message }
        );
        return;
      }

      // Call OpenAI to get name ideas
      let aiResponse = "No names found.";
      try {
        const openaiRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a creative branding specialist. Suggest a list of 6 memorable, creative, relevant and modern names for the following description. Reply with names only, one per line, no commentary." },
              { role: "user", content: `Theme: ${input}` }
            ]
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            }
          }
        );

        aiResponse = openaiRes.data.choices[0].message.content.trim();
      } catch (err) {
        console.error("OpenAI error:", err?.response?.data || err.message);
        aiResponse = "❌ Sorry, the OpenAI API request failed.";
      }

      const nameMsg =
`╔══════════════════════════════════╗
║    🏷️ *AI NAME IDEAS LIST* 🏷️     ║
╚══════════════════════════════════╝

📝 *Theme:*
${input}
${'─'.repeat(32)}
✨ *Name Ideas:*
${aiResponse}

${'═'.repeat(32)}
_Created by OpenAI + SAINt-MD Bot_
`;

      await client.sendMessage(
        chatId,
        { text: nameMsg },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error in ainames command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error with ainames command.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
