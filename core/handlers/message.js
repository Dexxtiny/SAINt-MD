import settings from "../../config/settings.js";
import logger from "../../utils/logger.js";

class MessageHandler {
  constructor(bot) {
    this.bot = bot;
    this.commands = new Map();
    this.commandHistory = [];
    this.lidMappings = new Map(); // Store phone->LID mappings
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

  // Check if user is group admin (LID compatible)
  async isGroupAdmin(sender, jid) {
    if (!jid.endsWith('@g.us')) return false;

    try {
      const groupMetadata = await this.bot.client.groupMetadata(jid);
      
      // Handle both LID and phone number formats
      const participant = groupMetadata.participants.find(p => 
        p.id === sender || 
        this.normalizeJid(p.id) === this.normalizeJid(sender)
      );
      
      return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
      logger.error('Error checking admin status:', error);
      return false;
    }
  }

  // Normalize JID for comparison (remove domain and device)
  normalizeJid(jid) {
    if (!jid) return jid;
    // Remove everything after : (device ID) and @ (domain)
    return jid.split(':')[0].split('@')[0];
  }

  // Get sender ID handling both @s.whatsapp.net and @lid
  getSenderId(message) {
    return message.key.participant || message.key.remoteJid;
  }

  // Extract LID from credentials (for your custom pairing)
  extractLidFromCreds() {
    try {
      // Access the LID from your custom creds structure
      if (this.bot.client?.authState?.creds?.me?.lid) {
        const lid = this.bot.client.authState.creds.me.lid;
        logger.info(`📱 Bot LID from creds: ${lid}`);
        return lid;
      }
      
      // Fallback: Check if we can access state directly
      if (this.bot.client?.state?.creds?.me?.lid) {
        const lid = this.bot.client.state.creds.me.lid;
        logger.info(`📱 Bot LID from state: ${lid}`);
        return lid;
      }
      
      logger.warn('Could not extract LID from credentials');
      return null;
    } catch (error) {
      logger.error('Error extracting LID from creds:', error);
      return null;
    }
  }

  // Extract phone number from credentials
  extractPhoneFromCreds() {
    try {
      if (this.bot.client?.authState?.creds?.me?.id) {
        const phoneJid = this.bot.client.authState.creds.me.id;
        const phone = this.normalizeJid(phoneJid);
        logger.info(`📱 Bot phone from creds: ${phone}`);
        return phone;
      }
      return null;
    } catch (error) {
      logger.error('Error extracting phone from creds:', error);
      return null;
    }
  }

  // Handle incoming messages
  async handleIncomingMessages(messages) {
    for (const message of messages) {
      try {
        if (!message.message) continue;

        const jid = message.key.remoteJid;
        const sender = this.getSenderId(message);
        const text = this.extractMessageText(message);

        // LOG FOR DEBUGGING - REMOVE LATER
        logger.info(`📱 Message from: ${sender} | Type: ${sender.includes('@lid') ? 'LID' : 'PHONE'}`);

        // Different logic for groups vs private
        const isGroup = jid.endsWith('@g.us');
        
        if (isGroup) {
          // GROUP: Check if sender is admin
          const isAdmin = await this.isGroupAdmin(sender, jid);
          if (!isAdmin) continue;
        } else {
          // PRIVATE: Use authorization (supports both LID and phone)
          if (!this.isAuthorized(sender, jid)) {
            logger.warn(`🚫 Unauthorized access attempt from: ${sender}`);
            continue;
          }
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

  // Authorization that supports BOTH LIDs and phone numbers
  isAuthorized(sender, jid) {
    try {
      // Handle LID format (your custom format: 151892088885356:33@lid)
      if (sender.includes('@lid')) {
        const lid = sender;
        
        // Option 1: Check against authorized LIDs list
        if (settings.authorizedLids && settings.authorizedLids.includes(lid)) {
          return true;
        }
        
        // Option 2: Check if this is the bot's own LID
        const botLid = this.extractLidFromCreds();
        if (botLid === lid) {
          return true; // Bot itself is always authorized
        }
        
        // Option 3: Check if we have a phone mapping for this LID
        for (let [phone, storedLid] of this.lidMappings) {
          if (storedLid === lid) {
            return settings.authorizedNumbers.includes(phone);
          }
        }
        
        return false;
      }
      
      // Handle phone number format (2347088246238:33@s.whatsapp.net)
      if (sender.includes('@s.whatsapp.net')) {
        const phoneNumber = this.normalizeJid(sender);
        
        // Store the mapping when we see a phone number
        if (settings.authorizedNumbers.includes(phoneNumber)) {
          return true;
        }
        
        // Check if this is the bot's own phone
        const botPhone = this.extractPhoneFromCreds();
        if (botPhone === phoneNumber) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error in authorization check:', error);
      return false;
    }
  }

  // Learn LID mapping when we see both formats
  learnLidMapping(phoneNumber, lid) {
    this.lidMappings.set(phoneNumber, lid);
    logger.info(`📚 Learned LID mapping: ${phoneNumber} -> ${lid}`);
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
        sender,
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

  // Get LID mappings (for debugging)
  getLidMappings() {
    return Object.fromEntries(this.lidMappings);
  }
}

export default MessageHandler;