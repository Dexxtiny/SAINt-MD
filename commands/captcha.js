import fs from 'fs';

const CAPTCHA_FILE = './captcha_settings.json';
const PENDING_USERS = new Map();

export default {
    name: "captcha",
    description: "Verify new members manually", 
    category: "moderation",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            
            if (!chat.endsWith('@g.us')) {
                await client.sendMessage(chat, { 
                    text: "❌ This command only works in groups!" 
                }, { quoted: message });
                return;
            }

            const targetUser = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            // If no user mentioned, show usage
            if (!targetUser) {
                await client.sendMessage(chat, { 
                    text: `🛡️ *MANUAL MEMBER VERIFICATION*\n\nUsage:\n• captcha @user - Send verification to user\n• captcha approve @user - Manually approve user\n• captcha kick @user - Remove unverified user`
                }, { quoted: message });
                return;
            }

            const action = args[0]?.toLowerCase();
            
            // ✅ APPROVE USER (Manual approval)
            if (action === 'approve') {
                PENDING_USERS.delete(targetUser);
                await client.sendMessage(chat, {
                    text: `✅ @${targetUser.split('@')[0]} has been manually approved by admin! Welcome! 🎉`,
                    mentions: [targetUser]
                });
                return;
            }
            
            // ✅ KICK USER (Manual removal)
            if (action === 'kick') {
                PENDING_USERS.delete(targetUser);
                await client.groupParticipantsUpdate(chat, [targetUser], "remove");
                await client.sendMessage(chat, {
                    text: `❌ @${targetUser.split('@')[0]} has been removed by admin.`,
                    mentions: [targetUser]
                });
                return;
            }

            // ✅ SEND VERIFICATION TO USER
            const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
            
            PENDING_USERS.set(targetUser, { 
                code: verificationCode, 
                groupJid: chat, 
                expires: expiryTime 
            });
            
            await client.sendMessage(chat, {
                text: `👋 @${targetUser.split('@')[0]}!\n\n🛡️ *VERIFICATION REQUIRED*\n\nPlease type this code to verify:\n\n📟 *${verificationCode}*\n\nYou have 10 minutes to type the code.`,
                mentions: [targetUser]
            });
            
            // Auto-remove after 10 minutes
            setTimeout(() => {
                if (PENDING_USERS.has(targetUser)) {
                    PENDING_USERS.delete(targetUser);
                    client.sendMessage(chat, {
                        text: `❌ @${targetUser.split('@')[0]} verification timeout! User removed.`,
                        mentions: [targetUser]
                    });
                    client.groupParticipantsUpdate(chat, [targetUser], "remove")
                        .catch(error => console.error('Auto-remove failed:', error));
                }
            }, 10 * 60 * 1000);

        } catch (error) {
            console.error('Error in captcha command:', error);
            await client.sendMessage(message.key.remoteJid, { 
                text: "❌ Error processing verification." 
            }, { quoted: message });
        }
    },

    // ✅ VERIFICATION CHECKER (for message content scanning)
    async checkVerification(message, client) {
        try {
            const userJid = message.key.participant || message.key.remoteJid;
            const userMessage = message.message?.conversation?.trim().toUpperCase();
            
            if (!PENDING_USERS.has(userJid) || !userMessage) return false;
            
            const verificationData = PENDING_USERS.get(userJid);
            
            // Check if expired
            if (Date.now() > verificationData.expires) {
                PENDING_USERS.delete(userJid);
                await client.sendMessage(verificationData.groupJid, {
                    text: `❌ @${userJid.split('@')[0]} verification timeout! User removed.`,
                    mentions: [userJid]
                });
                await client.groupParticipantsUpdate(verificationData.groupJid, [userJid], "remove");
                return true;
            }
            
            // Check if message contains the code
            if (userMessage.includes(verificationData.code)) {
                PENDING_USERS.delete(userJid);
                await client.sendMessage(verificationData.groupJid, {
                    text: `✅ @${userJid.split('@')[0]} verified successfully! Welcome to the group! 🎉`,
                    mentions: [userJid]
                });
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Error checking verification:', error);
            return false;
        }
    }
};

// Load/save settings
function loadCaptchaSettings() {
    try {
        if (fs.existsSync(CAPTCHA_FILE)) {
            return JSON.parse(fs.readFileSync(CAPTCHA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
    return {};
}

function saveCaptchaSettings(settings) {
    try {
        fs.writeFileSync(CAPTCHA_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}