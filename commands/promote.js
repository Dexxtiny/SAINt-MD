export default {
    name: "promote",
    description: "Promote user to group admin",
    category: "moderation",
    groupAdminOnly: true,
    
    async execute(message, client, args) {
        try {
            const chat = message.key.remoteJid;
            
            // Only work in groups
            if (!chat.endsWith('@g.us')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ This command only works in groups!",
                    },
                    { quoted: message }
                );
                return;
            }

            const targetUser = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];

            if (!targetUser || !targetUser.includes('@')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ Please mention a user to promote!\n\nExample: !promote @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to promote yourself
            const sender = message.key.participant || message.key.remoteJid;
            if (targetUser === sender) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You cannot promote yourself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to promote bot
            if (targetUser === client.user.id) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot promote myself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if target is already admin
            const groupMetadata = await client.groupMetadata(chat);
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
            
            if (targetParticipant && (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: `❌ @${targetUser.split('@')[0]} is already an admin!`,
                        mentions: [targetUser]
                    },
                    { quoted: message }
                );
                return;
            }

            // Promote user to admin
            await client.groupParticipantsUpdate(
                chat,
                [targetUser],
                "promote"
            );

            await client.sendMessage(
                chat,
                { 
                    text: `⬆️ *USER PROMOTED!*\n\n@${targetUser.split('@')[0]} has been promoted to group admin! 🎉`,
                    mentions: [targetUser]
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing promote command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error promoting user. Make sure the user exists in the group.",
                },
                { quoted: message }
            );
        }
    },
};