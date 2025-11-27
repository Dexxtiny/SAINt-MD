import axios from "axios";

// Store active temp emails
const tempEmails = new Map();

export default {
    name: "temp",
    description: "Generate temporary email addresses and receive emails",
    category: "utility",
    
    async execute(message, client, args) {
        const chatId = message.key.remoteJid;
        
        try {
            const userId = message.key.participant || message.key.remoteJid;

            if (args[0]?.toLowerCase() === 'inbox') {
                return await checkInbox(client, chatId, userId, message);
            }

            if (args[0]?.toLowerCase() === 'delete') {
                return await deleteTempEmail(client, chatId, userId, message);
            }

            if (args[0]?.toLowerCase() === 'list') {
                return await listActiveEmails(client, chatId, userId, message);
            }

            // Generate new temp email
            await generateTempEmail(client, chatId, userId, message);

        } catch (error) {
            console.error('Temp email error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Error with temporary email service. Please try again later."
            }, { quoted: message });
        }
    }
};

async function generateTempEmail(client, chatId, userId, message) {
    try {
        await client.sendPresenceUpdate("composing", chatId);

        // Use reliable 1secmail API
        const response = await axios.get(
            "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1",
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error('No email generated');
        }

        const email = response.data[0];

        // Store email with user info
        tempEmails.set(userId, {
            email: email,
            api: '1secmail',
            createdAt: Date.now(),
            messages: [],
            lastChecked: Date.now(),
            processedIds: new Set() // Track processed email IDs
        });

        const emailMessage = `
📧 *TEMPORARY EMAIL CREATED* 📧

📮 *Email Address:* 
\`${email}\`

⏰ *Valid for:* 1 hour
📥 *Check inbox:* \`temp inbox\`
🗑️ *Delete email:* \`temp delete\`
📋 *Your emails:* \`temp list\`

💡 *How to use:*
1. Use this email to sign up for websites
2. Check \`temp inbox\` to see received emails
3. Emails auto-delete after 1 hour

⚡ *Tip:* Some services may block temp emails
        `.trim();

        await client.sendMessage(chatId, {
            text: emailMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Email generation error:', error);
        
        // Fallback to alternative service
        try {
            await generateTempEmailFallback(client, chatId, userId, message);
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            await client.sendMessage(chatId, {
                text: "❌ All temporary email services are currently unavailable. Please try again in a few minutes."
            }, { quoted: message });
        }
    }
}

async function generateTempEmailFallback(client, chatId, userId, message) {
    // Alternative: Generate random email with common domains
    const domains = ['mailinator.com', 'yopmail.com', 'tempmail.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const username = Math.random().toString(36).substring(2, 12);
    const email = `${username}@${randomDomain}`;

    tempEmails.set(userId, {
        email: email,
        api: 'manual',
        createdAt: Date.now(),
        messages: [],
        lastChecked: Date.now(),
        processedIds: new Set()
    });

    const emailMessage = `
📧 *TEMPORARY EMAIL CREATED* 📧

📮 *Email Address:* 
\`${email}\`

⚠️ *Note:* Manual email - use web interface:
• mailinator.com - Go to website, enter: ${username}
• yopmail.com - Visit site, use: ${username}

⏰ *Valid for:* 1 hour
📥 *Check:* Visit the website above
        `.trim();

    await client.sendMessage(chatId, {
        text: emailMessage
    }, { quoted: message });
}

async function checkInbox(client, chatId, userId, message) {
    try {
        const userEmail = tempEmails.get(userId);
        
        if (!userEmail) {
            await client.sendMessage(chatId, {
                text: "❌ You don't have an active temporary email!\n\nGenerate one with: `temp`"
            }, { quoted: message });
            return;
        }

        await client.sendPresenceUpdate("composing", chatId);

        // Extract login and domain from email
        const [login, domain] = userEmail.email.split('@');
        
        // Check inbox using 1secmail API
        const response = await axios.get(
            `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`,
            {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        const messages = response.data || [];
        userEmail.lastChecked = Date.now();

        if (!messages || messages.length === 0) {
            await client.sendMessage(chatId, {
                text: `📭 *INBOX EMPTY*\n\nEmail: \`${userEmail.email}\`\n\nNo messages found. Emails may take a few minutes to arrive.`
            }, { quoted: message });
            return;
        }

        // Get full details for each new message
        const newMessages = [];
        for (const msg of messages) {
            if (!userEmail.processedIds.has(msg.id)) {
                const fullMessage = await getMessageDetails(login, domain, msg.id);
                if (fullMessage) {
                    newMessages.push(fullMessage);
                    userEmail.processedIds.add(msg.id);
                    
                    // Store in messages array
                    userEmail.messages.push({
                        id: msg.id,
                        from: fullMessage.from,
                        subject: fullMessage.subject,
                        body: fullMessage.textBody || fullMessage.htmlBody,
                        date: new Date(msg.date)
                    });
                }
            }
        }

        if (newMessages.length === 0) {
            await client.sendMessage(chatId, {
                text: `📭 *NO NEW MESSAGES*\n\nEmail: \`${userEmail.email}\`\n\nYou have ${messages.length} messages, but no new ones since last check.`
            }, { quoted: message });
            return;
        }

        // Build inbox message
        let inboxMessage = `📬 *INBOX - ${userEmail.email}*\n`;
        inboxMessage += `📊 Found ${newMessages.length} new message(s)\n\n`;
        
        for (const [index, email] of newMessages.entries()) {
            inboxMessage += `━━━━━━━━━━━━━━━━━━━━\n`;
            inboxMessage += `📧 *Message ${index + 1}*\n`;
            inboxMessage += `👤 *From:* ${email.from}\n`;
            inboxMessage += `📝 *Subject:* ${email.subject || 'No Subject'}\n`;
            inboxMessage += `🕒 *Date:* ${new Date(email.date).toLocaleString()}\n\n`;
            
            // Show message preview (truncate if too long)
            const messageBody = email.textBody || 
                              (email.htmlBody ? email.htmlBody.replace(/<[^>]*>/g, '') : 'No content');
            
            const preview = messageBody.length > 200 
                ? messageBody.substring(0, 200) + '...' 
                : messageBody;
            
            if (preview) {
                inboxMessage += `📄 *Message:* ${preview}\n\n`;
            }
        }

        inboxMessage += `💡 *Check again:* \`temp inbox\``;

        await client.sendMessage(chatId, {
            text: inboxMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Inbox check error:', error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to check inbox. The email service might be temporarily unavailable. Try again in a minute."
        }, { quoted: message });
    }
}

async function getMessageDetails(login, domain, messageId) {
    try {
        const response = await axios.get(
            `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${messageId}`,
            {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting message details:', error);
        return null;
    }
}

async function deleteTempEmail(client, chatId, userId, message) {
    const userEmail = tempEmails.get(userId);
    
    if (!userEmail) {
        await client.sendMessage(chatId, {
            text: "❌ You don't have an active temporary email to delete!"
        }, { quoted: message });
        return;
    }

    const emailAddress = userEmail.email;
    tempEmails.delete(userId);
    
    await client.sendMessage(chatId, {
        text: `🗑️ *EMAIL DELETED*\n\nTemporary email \`${emailAddress}\` has been deleted.\n\nGenerate a new one with: \`temp\``
    }, { quoted: message });
}

async function listActiveEmails(client, chatId, userId, message) {
    const userEmail = tempEmails.get(userId);
    
    if (!userEmail) {
        await client.sendMessage(chatId, {
            text: "❌ You don't have an active temporary email!\n\nGenerate one with: `temp`"
        }, { quoted: message });
        return;
    }

    const emailAge = Math.floor((Date.now() - userEmail.createdAt) / (1000 * 60));
    const minutesLeft = 60 - emailAge;

    const listMessage = `
📋 *YOUR TEMPORARY EMAIL*

📮 *Address:* \`${userEmail.email}\`
🔧 *Service:* ${userEmail.api}
⏰ *Created:* ${new Date(userEmail.createdAt).toLocaleTimeString()}
🕒 *Age:* ${emailAge}m (${minutesLeft}m remaining)
📬 *Total messages:* ${userEmail.messages.length}
🔍 *Last checked:* ${new Date(userEmail.lastChecked).toLocaleTimeString()}

💡 *Commands:*
• \`temp inbox\` - Check messages
• \`temp delete\` - Delete this email
• \`temp\` - Generate new email

⚠️ *Emails auto-delete after 1 hour*
    `.trim();

    await client.sendMessage(chatId, {
        text: listMessage
    }, { quoted: message });
}

// Cleanup old emails every minute
setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [userId, emailData] of tempEmails.entries()) {
        if (now - emailData.createdAt > oneHour) {
            tempEmails.delete(userId);
            console.log(`Cleaned up expired email for user: ${userId}`);
        }
    }
}, 60 * 1000); // Run every minute