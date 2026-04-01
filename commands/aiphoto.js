import axios from "axios";

export default {
  name: "aiphoto",
  description: "Generate an AI-powered image with DALL·E from your prompt.",
  category: "tools",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text:
              "🖼️ *Usage:* aiphoto <your image prompt>\n\n_Example:_ aiphoto cat surfing a rainbow"
          },
          { quoted: message }
        );
        return;
      }

      const prompt = args.join(" ");
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

      // Call OpenAI DALL·E endpoint
      let imageUrl = null;
      let responseText = "";
      try {
        const resp = await axios.post(
          "https://api.openai.com/v1/images/generations",
          {
            prompt: prompt,
            n: 1,
            size: "512x512" // or "1024x1024" if you want bigger
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        imageUrl = resp.data.data?.[0]?.url;
        responseText = "🎨 *Here is your AI-generated photo!*";
        if (!imageUrl) {
          responseText = "❌ Sorry, no image was generated.";
        }
      } catch (err) {
        console.error("OpenAI error:", err?.response?.data || err.message);
        responseText = "❌ The OpenAI API request failed.";
      }

      // Build the styled caption/response
      let box = 
`╔══════════════════════════════╗
║    🖼️ *AI PHOTO GENERATOR* 🖼️   ║
╚════════════════════════════��═╝

📝 *Prompt:*\n${prompt}
${'─'.repeat(32)}
${responseText}
${'═'.repeat(32)}
_Image by DALL·E + SAINt-MD Bot_
`;

      if (imageUrl) {
        await client.sendMessage(
          chatId,
          {
            image: { url: imageUrl },
            caption: box
          },
          { quoted: message }
        );
      } else {
        // fallback if no image/failed
        await client.sendMessage(
          chatId,
          { text: box },
          { quoted: message }
        );
      }
    } catch (error) {
      console.error("Error in aiphoto command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error with aiphoto command.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
