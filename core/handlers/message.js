import settings from "./config/settings.js";
import logger from "./utils/logger.js";

class MessageHandler {
  constructor(bot, commandHandler) {
    this.bot = bot;
    this.commandHandler = commandHandler;
  }

  // Initialize listener
  initialize() {
    this.bot.client.ev.on("messages.upsert", async ({ messages }) => {
      await this.handleIncomingMessages(messages);
    });
    logger.info("📩 Message handler initialized");
  }

  // Handle incoming messages
  async handleIncomingMessages(messages) {
    for (const message of messages) {
      try {
        if (!message.message) continue;

        const jid = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const text = this.extractMessageText(message);

        logger.debug(`Incoming from ${sender}: ${text}`);

        // Private chat authorization
        if (!jid.endsWith("@g.us")) {
          if (!this.isAuthorized(sender)) {
            logger.warn(`🚫 Unauthorized sender: ${sender}`);
            continue;
          }
        }

        // Check if it's a command
        if (this.isCommand(text)) {
          await this.processCommand(text, jid, message, sender);
        }
      } catch (error) {
        logger.error("Error handling message:", error);
      }
    }
  }

  // Extract text from different message types
  extractMessageText(message) {
    if (message.message.conversation) return message.message.conversation;
    if (message.message.extendedTextMessage?.text) return message.message.extendedTextMessage.text;
    if (message.message.imageMessage?.caption) return message.message.imageMessage.caption;
    return "";
  }

  // Authorization check using settings.js
  isAuthorized(sender) {
    const phone = this.normalizeJid(sender);
    return settings.authorizedNumbers.includes(phone);
  }

  // Normalize JID (strip domain/device)
  normalizeJid(jid) {
    if (!jid) return jid;
    return jid.split(":")[0].split("@")[0];
  }

  // Check if text starts with prefix
  isCommand(text) {
    return text && text.startsWith(settings.bot.prefix);
  }

  // Process command
  async processCommand(fullCommand, jid, originalMessage, sender) {
    try {
      const [commandName, ...args] = fullCommand
        .slice(settings.bot.prefix.length)
        .trim()
        .split(/\s+/);

      logger.info(`⚡ Command: ${commandName} from ${sender}`);

      const command = this.commandHandler.getCommand(commandName);
      if (!command) {
        await this.sendMessage(jid, { text: `❌ Unknown command: ${commandName}` }, originalMessage);
        return;
      }

      // Restriction checks
      if (command.groupOnly && !jid.endsWith("@g.us")) {
        await this.sendMessage(jid, { text: "❌ This command can only be used in groups." }, originalMessage);
        return;
      }

      if (command.privateOnly && jid.endsWith("@g.us")) {
        await this.sendMessage(jid, { text: "❌ This command can only be used in private chats." }, originalMessage);
        return;
      }

      if (command.groupAdminOnly && jid.endsWith("@g.us")) {
        const isAdmin = await this.isGroupAdmin(sender, jid);
        if (!isAdmin) {
          await this.sendMessage(jid, { text: "❌ Only group admins can use this command." }, originalMessage);
          return;
        }
      }

      // Execute command
      await command.execute(originalMessage, this.bot.client, args);
    } catch (error) {
      logger.error(`Error processing command: ${fullCommand}`, error);
      await this.sendMessage(jid, { text: "❌ Error executing command." }, originalMessage);
    }
  }

  // Check if user is group admin
  async isGroupAdmin(sender, jid) {
    try {
      const groupMetadata = await this.bot.client.groupMetadata(jid);
      const participant = groupMetadata.participants.find(p => p.id === sender);
      return participant && (participant.admin === "admin" || participant.admin === "superadmin");
    } catch (error) {
      logger.error("Error checking admin status:", error);
      return false;
    }
  }

  // Send message helper
  async sendMessage(jid, content, quotedMessage = null) {
    try {
      const options = quotedMessage ? { quoted: quotedMessage } : {};
      await this.bot.client.sendMessage(jid, content, options);
    } catch (error) {
      logger.error(`Error sending message to ${jid}:`, error);
    }
  }
}

export default MessageHandler;
