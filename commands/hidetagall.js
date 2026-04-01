import logger from "../utils/logger.js";

export default {
    name: "hidetagall",
    description: "Silently tag all group members, admins, and owner",
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

            const metadata = await client.groupMetadata(groupId);
            const members = metadata.participants.map(p => p.id);
            const ownerId = metadata.owner ? [metadata.owner] : [];

            const allMentions = [...new Set([...members, ...ownerId])];

            const customMessage = args.length > 0 
                ? args.join(" ") 
                : "🔕 Silent tagging everyone...";

            // Silent tagging: no usernames shown, only mentions
            await client.sendMessage(
                groupId,
                {
                    text: customMessage,
                    mentions: allMentions
                },
                { quoted: message }
            );

        } catch (error) {
            logger.error("Error executing hidetagall command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error running hidetagall command. Please try again later.",
                },
                { quoted: message }
            );
        }
    },
};
