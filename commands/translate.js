import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "translate",
  description: "Translate text between languages",
  category: "utility",
  async execute(message, client, args) {
    try {
      if (!args || args.length < 2) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text:
              "❌ *Usage:* !translate [language] [text]\n\n" +
              "💡 *Examples:*\n" +
              "• `!translate es Hello world` - English to Spanish\n" +
              "• `!translate fr Bonjour` - French to English\n" +
              "• `!translate de How are you` - English to German\n\n" +
              "🌐 *Supported languages:* es, fr, de, it, pt, ru, ja, ko, zh, ar, hi",
          },
          { quoted: message }
        );
        return;
      }

      const targetLang = args[0].toLowerCase();
      const textToTranslate = args.slice(1).join(" ");

      if (textToTranslate.length > 500) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text: "❌ Text too long. Please keep it under 500 characters.",
          },
          { quoted: message }
        );
        return;
      }

      // Show typing indicator
      await client.sendPresenceUpdate("composing", message.key.remoteJid);

      // Translate text
      const translation = await translateText(textToTranslate, targetLang);

      const response = `
🌐 *TRANSLATION*

📝 Original (${detectLanguage(textToTranslate)}):
${textToTranslate}

🔄 Translated (${getLanguageName(targetLang)}):
${translation}

💫 Powered by LibreTranslate
            `.trim();

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: response,
        },
        { quoted: message }
      );
    } catch (error) {
      logger.error("Error executing translate command:", error);

      await client.sendMessage(
        message.key.remoteJid,
        {
          text:
            "❌ Error translating text. Please check the language code and try again.\n\n" +
            "💡 Supported codes: es, fr, de, it, pt, ru, ja, ko, zh, ar, hi",
        },
        { quoted: message }
      );
    }
  },
};

// Translate text using LibreTranslate
async function translateText(text, targetLang) {
  try {
    const response = await axios.post(
      "https://libretranslate.de/translate",
      {
        q: text,
        source: "auto",
        target: targetLang,
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return response.data.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Translation service unavailable");
  }
}

// Get language name from code
function getLanguageName(code) {
  const languages = {
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ar: "Arabic",
    hi: "Hindi",
    en: "English",
  };

  return languages[code] || code.toUpperCase();
}

// Simple language detection (basic)
function detectLanguage(text) {
  // Basic detection - in real implementation, you might use a library
  if (/[а-яА-Я]/.test(text)) return "Russian";
  if (/[一-龯]/.test(text)) return "Chinese";
  if (/[あ-ん]/.test(text)) return "Japanese";
  if (/[가-힣]/.test(text)) return "Korean";
  if (/[áéíóúñ]/.test(text)) return "Spanish";
  if (/[àâçéèêëîïôûùüÿ]/.test(text)) return "French";
  if (/[äöüß]/.test(text)) return "German";

  return "Unknown";
}
