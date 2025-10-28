import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "quote",
  description: "Get inspirational quotes",
  category: "motivation",
  async execute(message, client, args) {
    try {
      // Show typing indicator
      await client.sendPresenceUpdate("composing", message.key.remoteJid);

      // Fetch random quote from ZenQuotes
      const quoteData = await fetchQuote();

      const response = `
✨ *INSPIRATIONAL QUOTE* ✨

${quoteData.q}

- *${quoteData.a}*

💫 Let this wisdom guide your day!
            `.trim();

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: response,
        },
        { quoted: message }
      );
    } catch (error) {
      logger.error("Error executing quote command:", error);

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ Error fetching quote. Please try again later.",
        },
        { quoted: message }
      );
    }
  },
};

// Fetch quote from ZenQuotes API
async function fetchQuote() {
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    return response.data[0];
  } catch (error) {
    console.error("Error fetching from ZenQuotes:", error);

    // Fallback quotes
    return {
      q: "The only way to do great work is to love what you do.",
      a: "Steve Jobs",
    };
  }
}
