import logger from "../utils/logger.js";

export default {
    name: "add",
    description: "Add people to a group",
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

            if (args.length < 1) {
                await client.sendMessage(
                    groupId,
                    {
                        text: `👥 *ADD COMMAND*\n\nUsage:\n• add [phone numbers]\n\nExamples:\n• add 2348012345678\n• add 2348012345678 2348098765432`,
                    },
                    { quoted: message }
                );
                return;
            }

            await client.sendPresenceUpdate("composing", groupId);

            const numbers = args.map(num => {
                let clean = num.replace(/[^0-9]/g, "");
                if (!clean.endsWith("@s.whatsapp.net")) {
                    clean = clean + "@s.whatsapp.net";
                }
                return clean;
            });

            await client.groupParticipantsUpdate(groupId, numbers, "add");

            await client.sendMessage(
                groupId,
                {
                    text: `✅ Added members:\n${numbers.join("\n")}`,
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing add command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error adding members. Make sure the numbers are valid and you have admin rights.",
                },
                { quoted: message }
            );
        }
    },
};
