import logger from "../utils/logger.js";

export default {
    name: "kick",
    description: "Remove members from a group (by number or reply)",
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

            let numbers = [];

            // Case 1: Kick by reply
            const quotedParticipant =
                message.message?.extendedTextMessage?.contextInfo?.participant;

            if (quotedParticipant) {
                numbers.push(quotedParticipant);
            }

            // Case 2: Kick by numbers in args
            if (args.length > 0) {
                const parsed = args.map(num => {
                    let clean = num.replace(/[^0-9]/g, "");
                    if (!clean.endsWith("@s.whatsapp.net")) {
                        clean = clean + "@s.whatsapp.net";
                    }
                    return clean;
                });
                numbers = numbers.concat(parsed);
            }

            if (numbers.length < 1) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `👢 *KICK COMMAND*\n\nUsage:\n• kick [phone numbers]\n• Reply to a member’s message with: kick\n\nExamples:\n• kick 2348012345678\n• (Reply to a message) kick`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            await client.groupParticipantsUpdate(groupId, numbers, "remove");

            await client.sendMessage(
                groupId,
                {
                    text: `✅ Removed members:\n${numbers.join("\n")}`,
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing kick command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error removing members. Make sure the numbers are valid and you have admin rights.",
                },
                { quoted: message }
            );
        }
    },
};
