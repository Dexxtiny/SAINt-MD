export default {
  name: "adcopy",
  description: "Generate styled, attention-grabbing ad copy for your prompt.",
  category: "tools",

  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      if (!args || args.length === 0) {
        await client.sendMessage(
          chatId,
          {
            text: "📰 *Usage:* adcopy <your product or idea>\n\n_Example:_ adcopy Eco-friendly water bottle"
          },
          { quoted: message }
        );
        return;
      }

      const input = args.join(" ");
      // Simple sample copy generator (edit as needed for fancy copy)
      const headline = `✨ Discover the Future of ${input.charAt(0).toUpperCase() + input.slice(1)}! ✨`;
      const body = `Tired of the same old options? Experience innovation with *${input}*:\n\n` +
        "✅ Exceptional quality\n" +
        "✅ Designed for you\n" +
        "✅ Satisfaction guaranteed\n\n" +
        "🔗 Available now. Don't miss out!";
      const cta = "🚀 *Order today and feel the difference!*";

      const ad =
`╔══════════════════════════════╗
║      📢 *AD COPY MAKER* 📢      ║
╚══════════════════════════════╝

${headline}

${body}

${cta}

${'═'.repeat(30)}
_Brought to you by SAINt-MD Bot_
`;

      await client.sendMessage(
        chatId,
        { text: ad },
        { quoted: message }
      );
    } catch (error) {
      console.error("Error in adcopy command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error generating ad copy.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
