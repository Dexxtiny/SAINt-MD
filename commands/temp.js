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

        const apis = [
            {
                name: "temp-mail.org",
                url: "https://api.temp-mail.org/request/domains/format/json/",
                processor: (data) => {
                    const domains = data;
                    if (!domains || domains.length === 0) return null;
                    const randomString = Math.random().toString(36).substring(2, 12);
                    return `${randomString}@${domains[0]}`;
                }
            },
            {
                name: "guerrillamail",
                url: "https://api.guerrillamail.com/ajax.php?f=get_email_address",
                processor: (data) => {
                    return data.email_addr;
                }
            }
        ];

        let email = null;
        let usedApi = null;
        
        for (const api of apis) {
            try {
                console.log(`Trying ${api.name} API...`);
                const response = await axios.get(api.url, {
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*'
                    }
                });
                
                email = api.processor(response.data);
                if (email) {
                    usedApi = api.name;
                    console.log(`✅ Success with ${api.name}: ${email}`);
                    break;
                }
            } catch (error) {
                console.log(`❌ ${api.name} API failed:`, error.message);
                continue;
            }
        }

        if (!email) {
            throw new Error('All temp email APIs failed');
        }

        // Store email with user info
        tempEmails.set(userId, {
            email: email,
            api: usedApi,
            createdAt: Date.now(),
            messages: [],
            lastChecked: Date.now()
        });

        const emailMessage = `
📧 *TEMPORARY EMAIL CREATED* 📧

📮 *Email Address:* 
\`${email}\`

⏰ *Valid for:* 24 hours
📥 *Check inbox:* temp inbox
🗑️ *Delete email:* temp delete
📋 *Your emails:* temp list

💡 *Use this email for:*
• Signing up for websites
• Verifying accounts
• Avoiding spam
• Temporary registrations

⚠️ *Important:*
• Emails auto-delete after 24h
• Don't use for important accounts
• Check inbox regularly
        `.trim();

        await client.sendMessage(chatId, {
            text: emailMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Email generation error:', error);
        await client.sendMessage(chatId, {
            text: "❌ All temporary email services are currently unavailable. Please try again in a few minutes."
        }, { quoted: message });
    }
}

async function checkInbox(client, chatId, userId, message) {
    try {
        const userEmail = tempEmails.get(userId);
        
        if (!userEmail) {
            await client.sendMessage(chatId, {
                text: "❌ You don't have an active temporary email!\n\nGenerate one with: temp"
            }, { quoted: message });
            return;
        }

        await client.sendPresenceUpdate("composing", chatId);

        let emails = [];
        
        // Use different inbox checking based on which API was used
        if (userEmail.api === "guerrillamail") {
            // Guerrillamail inbox check
            const [username, domain] = userEmail.email.split('@');
            const sid = `${username}@${domain}`;
            
            const response = await axios.get(
                `https://api.guerrillamail.com/ajax.php?f=get_email_list&offset=0&sid=${sid}`,
                {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            emails = response.data.list || [];
            
        } else {
            // temp-mail.org inbox check (generic approach)
            const [username, domain] = userEmail.email.split('@');
            const response = await axios.get(
                `https://api.temp-mail.org/request/mail/id/${username}/format/json/`,
                {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            );

            emails = response.data || [];
        }

        userEmail.lastChecked = Date.now();

        if (!emails || emails.length === 0) {
            await client.sendMessage(chatId, {
                text: `📭 *INBOX EMPTY*\n\nEmail: \`${userEmail.email}\`\n\nNo new messages in your temporary inbox.`
            }, { quoted: message });
            return;
        }

        // Build inbox message
        let inboxMessage = `📬 *INBOX - ${userEmail.email}*\n\n`;
        
        for (const email of emails.slice(0, 10)) {
            inboxMessage += `📧 *From:* ${email.from || email.mail_from}\n`;
            inboxMessage += `📝 *Subject:* ${email.subject || 'No Subject'}\n`;
            inboxMessage += `🕒 *Date:* ${new Date(email.date || email.mail_timestamp * 1000).toLocaleString()}\n`;
            
            // Show preview if available
            if (email.body || email.mail_text) {
                const preview = (email.body || email.mail_text).substring(0, 80) + '...';
                inboxMessage += `📄 *Preview:* ${preview}\n`;
            }
            
            inboxMessage += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            // Store message
            if (!userEmail.messages.find(msg => msg.id === (email.id || email.mail_id))) {
                userEmail.messages.push({
                    id: email.id || email.mail_id,
                    from: email.from || email.mail_from,
                    subject: email.subject,
                    date: email.date || new Date(email.mail_timestamp * 1000).toISOString(),
                    body: email.body || email.mail_text
                });
            }
        }

        if (emails.length > 10) {
            inboxMessage += `📊 ...and ${emails.length - 10} more emails\n`;
        }

        inboxMessage += `\n💡 Use "temp inbox" again to check for new messages.`;

        await client.sendMessage(chatId, {
            text: inboxMessage
        }, { quoted: message });

    } catch (error) {
        console.error('Inbox check error:', error);
        await client.sendMessage(chatId, {
            text: "❌ Failed to check inbox. The email service might be temporarily unavailable."
        }, { quoted: message });
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

    tempEmails.delete(userId);
    
    await client.sendMessage(chatId, {
        text: `🗑️ *EMAIL DELETED*\n\nTemporary email \`${userEmail.email}\` has been deleted.\n\nGenerate a new one with: temp`
    }, { quoted: message });
}

async function listActiveEmails(client, chatId, userId, message) {
    const userEmail = tempEmails.get(userId);
    
    if (!userEmail) {
        await client.sendMessage(chatId, {
            text: "❌ You don't have an active temporary email!\n\nGenerate one with: temp"
        }, { quoted: message });
        return;
    }

    const emailAge = Math.floor((Date.now() - userEmail.createdAt) / (1000 * 60 * 60));
    const hoursLeft = 24 - emailAge;

    const listMessage = `
📋 *YOUR TEMPORARY EMAIL*

📮 *Address:* \`${userEmail.email}\`
🔧 *Service:* ${userEmail.api}
⏰ *Created:* ${new Date(userEmail.createdAt).toLocaleString()}
🕒 *Age:* ${emailAge}h (${hoursLeft}h remaining)
📬 *Messages received:* ${userEmail.messages.length}
🔍 *Last checked:* ${new Date(userEmail.lastChecked).toLocaleString()}

💡 *Commands:*
• temp inbox - Check messages
• temp delete - Delete this email
• temp - Generate new email
    `.trim();

    await client.sendMessage(chatId, {
        text: listMessage
    }, { quoted: message });
}

// Cleanup old emails every hour
setInterval(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    for (const [userId, emailData] of tempEmails.entries()) {
        if (now - emailData.createdAt > twentyFourHours) {
            tempEmails.delete(userId);
            console.log(`Cleaned up expired email for user: ${userId}`);
        }
    }
}, 60 * 60 * 1000); // Run every hour