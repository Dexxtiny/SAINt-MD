import logger from "../utils/logger.js";

export default {
    name: "mediafire",
    description: "Generate categorized MediaFire-style links (Direct, Shortened, Custom)",
    category: "utility",

    async execute(message, client, args) {
        try {
            const quotedText =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
                null;

            const fileName = args.join(" ") || quotedText || "example-file.zip";

            if (!fileName) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `📂 *MEDIAFIRE COMMAND*\n\nUsage:\n• mediafire [filename]\n• Reply to any message with: mediafire\n\nExamples:\n• mediafire project-docs.zip\n• mediafire music-pack.mp3\n• mediafire app-release.apk`,
                    },
                    { quoted: message }
                );
                return;
            }

            // Show typing indicator
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Generate categorized MediaFire links
            const results = await generateMediafire(fileName);

            const response = `
${getMediafireArt()}
📂 *MEDIAFIRE FILE DROP*
${getMediafireArt()}

📝 *File:* ${fileName}

💡 *Direct:*  
${results.direct}

💡 *Shortened:*  
${results.shortened}

💡 *Custom:*  
${results.custom}

${getMediafireArt()}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                { text: response },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing mediafire command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error generating MediaFire link. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};

// Categorized MediaFire link generator
async function generateMediafire(fileName) {
    try {
        const safeName = fileName.replace(/\s+/g, "_");
        const direct = `https://www.mediafire.com/file/username/${safeName}`;
        const shortened = `https://mfire.co/${safeName}`;
        const custom = `https://mediafire.com/customdrop/${safeName}`;

        return { direct, shortened, custom };
    } catch (error) {
        logger.error("Error generating MediaFire link:", error);
        return { direct: "Unable to generate.", shortened: "Unable to generate.", custom: "Unable to generate." };
    }
}

// Decorative art for MediaFire messages
function getMediafireArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "📂─────────────────📂",
        "⊱──────── 💡 ────────⊰",
        "»»────── 🔗 ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
