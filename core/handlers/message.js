import settings from "../../config/settings.js";
import logger from "../../utils/logger.js";

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.commandHistory = [];
  }

  // Initialize message handler
  initialize() {
    this.bot.client.ev.on("messages.upsert", ({ messages }) => {
      this.handleIncomingMessages(messages);
    });
    logger.info("Message handler initialized");
  }

  // Register a command
  registerCommand(name, handler) {
    this.commands.set(name, handler);
    logger.debug(`Command registered: ${name}`);
  }

  // Check if user is group admin
  async isGroupAdmin(sender, jid) {
    if (!jid.endsWith('@g.us')) return false;

    try {
      const groupMetadata = await this.bot.client.groupMetadata(jid);
      const participant = groupMetadata.participants.find(p => p.id === sender);
      return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
      logger.error('Error checking admin status:', error);
      return false;
    }
  }

  // Get sender ID handling both @c.us and @lid
  getSenderId(message) {
    return message.key.participant || message.key.remoteJid;
  }

  // Handle incoming messages
  async handleIncomingMessages(messages) {
    for (const message of messages) {
      try {
        if (!message.message) continue;

        const jid = message.key.remoteJid;
        const sender = this.getSenderId(message);
        const text = this.extractMessageText(message);

        // Different logic for groups vs private
        const isGroup = jid.endsWith('@g.us');
        
        if (isGroup) {
          // GROUP: Check if sender is admin
          const isAdmin = await this.isGroupAdmin(sender, jid);
          if (!isAdmin) continue;
        } else {
          // PRIVATE: Use authorization
          if (!this.isAuthorized(sender, jid)) continue;
        }

        // Check if message is a command
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
    if (message.message.conversation) {
      return message.message.conversation;
    }
    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    return "";
  }

  // Authorization only for private chats
  isAuthorized(sender, jid) {
    try {
      let phoneNumber = sender.split("@")[0];
      if (phoneNumber.includes(':')) {
        phoneNumber = phoneNumber.split(':')[0];
      }
      phoneNumber = phoneNumber.replace(/\D/g, "");
      return settings.authorizedNumbers.includes(phoneNumber);
    } catch (error) {
      logger.error('Error in authorization check:', error);
      return false;
    }
  }

  // Check if message is a command
  isCommand(text) {
    return text && text.startsWith(settings.bot.prefix);
  }

  // Process command
  async processCommand(fullCommand, jid, originalMessage, sender) {
    try {
      const [command, ...args] = fullCommand
        .slice(settings.bot.prefix.length)
        .split(" ");
      const commandName = command.toLowerCase();

      logger.info(`Processing command: ${commandName} from ${sender} in ${jid}`);

      // Add to command history
      this.addToHistory({
        command: commandName,
        args,
        jid,
        timestamp: new Date().toISOString(),
      });

      // Check if command exists
      if (!this.commands.has(commandName)) {
        await this.sendMessage(
          jid,
          {
            text: `❌ Unknown command: ${commandName}\n\nUse ${settings.bot.prefix}help to see available commands.`,
          },
          originalMessage
        );
        return;
      }

      const commandHandler = this.commands.get(commandName);

      // Check command restrictions
      if (commandHandler.groupAdminOnly && jid.endsWith('@g.us')) {
        const isAdmin = await this.isGroupAdmin(sender, jid);
        if (!isAdmin) {
          await this.sendMessage(jid, { text: `❌ This command can only be used by group admins.` }, originalMessage);
          return;
        }
      }

      if (commandHandler.groupOnly && !jid.includes('@g.us')) {
        await this.sendMessage(jid, { text: `❌ This command can only be used in groups.` }, originalMessage);
        return;
      }

      if (commandHandler.privateOnly && jid.includes('@g.us')) {
        await this.sendMessage(jid, { text: `❌ This command can only be used in private chats.` }, originalMessage);
        return;
      }

      // Execute command
      await commandHandler.execute(originalMessage, this.bot.client, args);
    } catch (error) {
      logger.error(`Error processing command: ${fullCommand}`, error);
      await this.sendMessage(jid, { text: "❌ An error occurred while processing your command." }, originalMessage);
    }
  }

  // Send message helper
  async sendMessage(jid, content, quotedMessage = null) {
    try {
      const options = quotedMessage ? { quoted: quotedMessage } : {};
      await this.bot.client.sendMessage(jid, content, options);
    } catch (error) {
      logger.error(`Error sending message to ${jid}:`, error);
      throw error;
    }
  }

  // Add command to history
  addToHistory(entry) {
    this.commandHistory.unshift(entry);
    if (this.commandHistory.length > settings.bot.maxCommandHistory) {
      this.commandHistory.pop();
    }
  }

  // Get command history
  getCommandHistory(limit = 10) {
    return this.commandHistory.slice(0, limit);
  }

  // Get available commands
  getAvailableCommands() {
    return Array.from(this.commands.keys()).sort();
  }
}

export default MessageHandler;