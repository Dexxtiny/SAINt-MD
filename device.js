import logger from "../utils/logger.js";
import os from "os";

export default {
    name: "device",
    description: "Show information about the bot's running device",
    category: "owner",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            // Collect device info
            const deviceInfo = {
                platform: os.platform(),
                release: os.release(),
                arch: os.arch(),
                hostname: os.hostname(),
                uptime: `${Math.floor(os.uptime() / 3600)}h ${Math.floor((os.uptime() % 3600) / 60)}m`,
            };

            const response = `
${getDeviceArt()}
💻 *DEVICE INFORMATION*
${getDeviceArt()}

📌 Platform: ${deviceInfo.platform}  
📌 Release: ${deviceInfo.release}  
📌 Architecture: ${deviceInfo.arch}  
📌 Hostname: ${deviceInfo.hostname}  
📌 Uptime: ${deviceInfo.uptime}  

⚡ Bot is running smoothly on this environment.

${getDeviceArt()}
            `.trim();

            await client.sendMessage(
                chatId,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing device command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running device command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

function getDeviceArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "💻─────────────────💻",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
