import logger from "../utils/logger.js";

export default {
    name: "addsudo",
    description: "Add a user to the sudo list",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const groupId = message.key.remoteJid;

            // Detect quoted participant or argument
            const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
            const targetId = quotedParticipant || args[0];

            if (!targetId) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `⚡ *ADDSUDO COMMAND*\n\nUsage:\n• addsudo [user JID]\n• (Reply to a user) addsudo\n\nExample:\n• addsudo 2348012345678@s.whatsapp.net`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            try {
                // Save sudo user to database
                db.addSudo(targetId);

                const response = `
${getSudoArt()}
⚡ *SUDO USER ADDED*
${getSudoArt()}

👤 User:  
${targetId}

✅ Status: Granted sudo privileges.
${getSudoArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response, mentions: [targetId] },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error adding sudo user:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to add sudo user. Please try again." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing addsudo command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running addsudo command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getSudoArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "⚡─────────────────⚡",
        "⊱──────── 👑 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
