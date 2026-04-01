import logger from "../utils/logger.js";

export default {
    name: "mute",
    description: "Mute the group (only admins can send messages)",
    category: "group",

    async execute(message, client, args) {
        try {
            const groupId = message.key.remoteJid;

            if (!groupId.endsWith("@g.us")) {
                await client.sendMessage(
                    groupId,
                    { text: "❌ This command only works in groups." },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            try {
                // Restrict group so only admins can send messages
                await client.groupSettingUpdate(groupId, "announcement");

                const response = `
${getMuteArt()}
🔇 *GROUP MUTED*
${getMuteArt()}

✅ Only admins can send messages now.  
👥 Members have been restricted.

${getMuteArt()}
                `.trim();

                await client.sendMessage(
                    groupId,
                    { text: response },
                    { quoted: message }
                );
            } catch (err) {
                logger.error("Error muting group:", err);
                await client.sendMessage(
                    groupId,
                    { text: "❌ Unable to mute group. Make sure you are an admin." },
                    { quoted: message }
                );
            }
        } catch (error) {
            logger.error("Error executing mute command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running mute command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getMuteArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🔇─────────────────🔇",
        "⊱──────── 👥 ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
