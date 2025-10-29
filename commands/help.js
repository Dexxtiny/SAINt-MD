import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.join(__dirname);

export default {
    name: "help",
    description: "Show detailed help for specific commands",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            // If no specific command requested, redirect to menu
            if (!args || args.length === 0) {
                await client.sendMessage(
                    chatId,
                    {
                        text: `📖 *COMMAND HELP*\n\nTo see help for a specific command:\n• help [command-name]\n\nExamples:\n• help weather\n• help tictactoe\n• help instagram\n\nTo see all available commands, use: menu`
                    },
                    { quoted: message }
                );
                return;
            }

            const commandName = args[0].toLowerCase();
            
            // Try to find and load the command file
            const commandInfo = await getCommandInfo(commandName);

            if (!commandInfo) {
                await client.sendMessage(
                    chatId,
                    {
                        text: `❌ Command "${commandName}" not found.\n\nUse "menu" to see all available commands.`
                    },
                    { quoted: message }
                );
                return;
            }

            // Generate detailed help from the command's export
            const helpMessage = generateCommandHelp(commandName, commandInfo);

            await client.sendMessage(
                chatId,
                {
                    text: helpMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing help command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: `❌ Error loading command help. Please try again.` 
                },
                { quoted: message }
            );
        }
    }
};

async function getCommandInfo(commandName) {
    try {
        const commandPath = path.join(commandsDir, `${commandName}.js`);
        
        // Check if command file exists
        if (!fs.existsSync(commandPath)) {
            return null;
        }

        // Dynamically import the command module
        const commandModule = await import(`file://${commandPath}`);
        
        if (commandModule.default) {
            const command = commandModule.default;
            return {
                name: command.name || commandName,
                description: command.description || 'No description available',
                category: command.category || 'general',
                // You can add more properties here if needed
            };
        }
        
        return null;
        
    } catch (error) {
        console.error(`Error loading command ${commandName}:`, error);
        return null;
    }
}

function generateCommandHelp(commandName, commandInfo) {
    let helpMessage = `📖 *${commandInfo.name.toUpperCase()} COMMAND*\n\n`;
    
    // Description
    helpMessage += `📝 *Description:* ${commandInfo.description}\n\n`;
    
    // Category
    helpMessage += `📂 *Category:* ${commandInfo.category}\n\n`;
    
    // Usage examples based on command name and category
    helpMessage += `🎯 *Usage Examples:*\n`;
    
    const examples = generateUsageExamples(commandInfo.name, commandInfo.category);
    examples.forEach(example => {
        helpMessage += `• ${example}\n`;
    });
    
    helpMessage += `\n💡 *Tip:* Use the command without arguments to see basic usage guide.`;
    
    return helpMessage;
}

function generateUsageExamples(commandName, category) {
    // Default examples that work for most commands
    const defaultExamples = [
        `${commandName}`,
        `${commandName} [parameters]`
    ];

    // Category-specific examples
    const categoryExamples = {
        'download': [
            `${commandName} [url]`,
            `${commandName} [reply to link]`
        ],
        'games': [
            `${commandName}`,
            `${commandName} [move/action]`,
            `${commandName} end`
        ],
        'utility': [
            `${commandName} [input]`,
            `${commandName} [options]`
        ],
        'moderation': [
            `${commandName} @user`,
            `${commandName} @user [reason]`
        ],
        'music': [
            `${commandName} [song name]`,
            `${commandName} [artist]`
        ],
        'tools': [
            `${commandName} [text/input]`,
            `${commandName} [options]`
        ],
        'fun': [
            `${commandName}`,
            `${commandName} [text]`
        ]
    };

    // Command-specific overrides
    const commandSpecificExamples = {
        'weather': ['weather London', 'weather New York', 'weather Tokyo'],
        'currency': ['currency 100 USD EUR', 'currency 5000 NGN USD', 'currency rates'],
        'sticker': ['sticker [reply to image]', 'sticker text Hello', 'sticker emoji 😂'],
        'meme': ['meme', 'meme create drake "good" | "bad"'],
        'tictactoe': ['tictactoe', 'tictactoe 5', 'tictactoe end'],
        'wordle': ['wordle', 'wordle APPLE', 'wordle hint'],
        'password': ['password 16', 'password 12 memorable', 'password 20 special'],
        'code': ['code html login page', 'code css navbar', 'code js calculator'],
        'feelart': ['feelart I feel happy', 'feelart Heartbroken', 'feelart Excited'],
        'imagine': ['imagine a sunset', 'imagine a city', 'imagine a cat'],
        'temp': ['temp', 'temp inbox', 'temp delete'],
        'uptime': ['uptime add https://site.com', 'uptime list', 'uptime status'],
        'instagram': ['instagram [url]', 'instagram [reply to link]'],
        'tiktok': ['tiktok [url]', 'tiktok [reply to link]']
    };

    // Return command-specific examples if available, then category-specific, then default
    return commandSpecificExamples[commandName] || 
           categoryExamples[category] || 
           defaultExamples;
}