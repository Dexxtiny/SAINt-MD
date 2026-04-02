import logger from "../utils/logger.js";

export default {
    name: "join",
    description: "Join a WhatsApp group using an invite link",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("typing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a valid WhatsApp group invite link." },
                    { quoted: message }
                );
                return;
            }

            const inviteLink = args[0];
            if (!inviteLink.includes("chat.whatsapp.com/")) {
                await client.sendMessage(
                    chatId,
                    { text: "⚠️ Invalid link. Please provide a proper WhatsApp group invite link." },
                    { quoted: message }
                );
                return;
            }

            const code = inviteLink.split("chat.whatsapp.com/")[1];

            // Attempt to join group
            await client.groupAcceptInvite(code);

            const response = `
${getJoinArt()}
🔗 *JOIN COMMAND EXECUTED*
${getJoinArt()}

✅ Bot has successfully joined the group.  
📌 Invite: ${inviteLink}  
⚡ Ready to assist in the new group.

${getJoinArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing join command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error running join command. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getJoinArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔗─────────────────🔗",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
