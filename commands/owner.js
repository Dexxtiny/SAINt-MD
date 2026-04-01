import process from "process";

export default {
  name: "owner",
  description: "Display information about the bot owner and get in touch",
  category: "utility",
  
  async execute(message, client, args) {
    try {
      const chatId = message.key.remoteJid;
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      let ownerMessage = `
╔════════════════════════════════════════╗
║         👑 *BOT OWNER INFO* 👑         ║
╚════════════════════════════════════════╝

`;

      // Owner Profile Section
      ownerMessage += `👨‍💼 *OWNER PROFILE*
${'═'.repeat(38)}
`;
      ownerMessage += `🔖 *Name:* Dexxtiny
`;
      ownerMessage += `💼 *Role:* Bot Developer & Creator
`;
      ownerMessage += `🌟 *Status:* Active Developer
`;
      ownerMessage += `📍 *Region:* Global
\n`;

      // Bot Statistics Section
      ownerMessage += `🤖 *BOT STATISTICS*
${'═'.repeat(38)}
`;
      ownerMessage += `📛 *Bot Name:* SAINt-MD
`;
      ownerMessage += `⚙️ *Bot Version:* 1.0.0
`;
      ownerMessage += `💻 *Platform:* WhatsApp Bot
`;
      ownerMessage += `🔧 *Language:* JavaScript (Node.js)
`;
      ownerMessage += `📚 *Library:* Baileys
\n`;

      // Bot Uptime Section
      ownerMessage += `⏱️ *BOT UPTIME*
${'═'.repeat(38)}
`;
      ownerMessage += `🟢 Status: Online & Running
`;
      ownerMessage += `⏰ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s
\n`;

      // Features Section
      ownerMessage += `✨ *BOT FEATURES*
${'═'.repeat(38)}
`;
      ownerMessage += `✅ 50+ Commands Available
`;
      ownerMessage += `✅ Multi-Format Media Support
`;
      ownerMessage += `✅ Real-time Data Integration
`;
      ownerMessage += `✅ Advanced Moderation Tools
`;
      ownerMessage += `✅ Interactive Games
`;
      ownerMessage += `✅ AI-Powered Features
`;
      ownerMessage += `✅ 24/7 Availability
\n`;

      // Contact Section
      ownerMessage += `📞 *CONTACT & SUPPORT*
${'═'.repeat(38)}
`;
      ownerMessage += `📧 Email: dexxtiny@mail.com
`;
      ownerMessage += `🐙 GitHub: github.com/Dexxtiny
`;
      ownerMessage += `💬 WhatsApp: wa.me/1234567890
`;
      ownerMessage += `🌐 Website: Coming Soon
\n`;

      // Footer
      ownerMessage += `${'═'.repeat(38)}
`;
      ownerMessage += `🎉 Thank you for using SAINt-MD!
`;
      ownerMessage += `Made with ❤️ by Dexxtiny`;

      await client.sendMessage(
        chatId,
        {
          text: ownerMessage
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("Error executing owner command:", error);
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: `❌ Error retrieving owner information.\n\nError: ${error.message}`
        },
        { quoted: message }
      );
    }
  }
};
