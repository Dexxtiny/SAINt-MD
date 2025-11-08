export default {
    name: "ban",
    description: "Remove users from the group",
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
                        text: "❌ Please mention a user to remove!\n\nExample: !ban @user",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to remove yourself
            const sender = message.key.participant || message.key.remoteJid;
            if (targetUser === sender) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ You cannot remove yourself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Check if trying to remove bot
            if (targetUser === client.user.id) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot remove myself!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Get group metadata once
            const groupMetadata = await client.groupMetadata(chat);
            const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
            
            // Check if target is admin
            if (targetParticipant && (targetParticipant.admin === 'admin' || targetParticipant.admin === 'superadmin')) {
                await client.sendMessage(
                    chat,
                    { 
                        text: "❌ I cannot remove another admin!",
                    },
                    { quoted: message }
                );
                return;
            }

            // Get reason
            const reason = args.slice(1).join(' ') || 'No reason provided';

            // Remove user from group
            await client.groupParticipantsUpdate(
                chat,
                [targetUser],
                "remove"
            );

            await client.sendMessage(
                chat,
                { 
                    text: `🔨 *USER REMOVED!*\n\n@${targetUser.split('@')[0]} has been removed from the group.\n\nReason: ${reason}`,
                    mentions: [targetUser]
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing ban command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: "❌ Error removing user. Make sure the user exists in the group.",
                },
                { quoted: message }
            );
        }
    },
};