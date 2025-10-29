import axios from "axios";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsDir = path.join(__dirname);

export default {
    name: "menu",
    description: "Show all available commands with cool design",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            
            // Get all commands from the commands folder
            const commands = await getAllCommands();
            
            // Split commands into pages of 8
            const pages = chunkArray(commands, 8);
            const pageIndex = parseInt(args[0]) || 0;
            const currentPage = pages[pageIndex] || pages[0];

            if (!currentPage || currentPage.length === 0) {
                await client.sendMessage(chatId, {
                    text: "❌ No commands found!"
                }, { quoted: message });
                return;
            }

            // Download and send the image with commands as caption
            const imageUrl = "https://i.postimg.cc/Z5H73X1Q/Copilot-20251029-083045.png";
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 15000
            });

            const imageBuffer = Buffer.from(imageResponse.data);
            
            // Create the menu caption with ASCII art
            const caption = createMenuCaption(currentPage, pageIndex, pages.length, commands.length);

            await client.sendMessage(chatId, {
                image: imageBuffer,
                caption: caption
            }, { quoted: message });

        } catch (error) {
            console.error('Menu command error:', error);
            
            // Fallback: Send text-only menu if image fails
            const commands = await getAllCommands();
            const pages = chunkArray(commands, 8);
            const currentPage = pages[0] || [];
            
            const fallbackMenu = createTextMenu(currentPage, 0, pages.length, commands.length);
            
            await client.sendMessage(chatId, {
                text: fallbackMenu
            }, { quoted: message });
        }
    }
};

async function getAllCommands() {
    try {
        const files = fs.readdirSync(commandsDir);
        const commands = [];

        for (const file of files) {
            if (file.endsWith('.js') && file !== 'menu.js' && file !== 'help.js') {
                const commandName = file.replace('.js', '');
                try {
                    const commandPath = path.join(commandsDir, file);
                    const commandModule = await import(`file://${commandPath}`);
                    
                    if (commandModule.default) {
                        const cmd = commandModule.default;
                        commands.push({
                            name: cmd.name || commandName,
                            description: cmd.description || 'No description',
                            category: cmd.category || 'general'
                        });
                    }
                } catch (error) {
                    console.error(`Error loading command ${file}:`, error);
                    // Still add basic command info even if loading fails
                    commands.push({
                        name: commandName,
                        description: 'Command description not available',
                        category: 'general'
                    });
                }
            }
        }

        // Sort commands by category and name
        return commands.sort((a, b) => {
            if (a.category === b.category) {
                return a.name.localeCompare(b.name);
            }
            return a.category.localeCompare(b.category);
        });

    } catch (error) {
        console.error('Error reading commands directory:', error);
        return [];
    }
}

function createMenuCaption(commands, currentPage, totalPages, totalCommands) {
    let caption = `╔══════════════════════════════╗\n`;
    caption += `║    🚀 SAVY DNI X BOT 🚀     ║\n`;
    caption += `║    🤖 COMMAND MENU 🤖       ║\n`;
    caption += `╚══════════════════════════════╝\n\n`;
    
    caption += `📋 *Available Commands:*\n`;
    caption += `✨ Total: ${totalCommands} commands\n\n`;

    // Group commands by category for this page
    const categories = {};
    commands.forEach(cmd => {
        if (!categories[cmd.category]) {
            categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
    });

    // Display commands in category boxes
    for (const [category, categoryCommands] of Object.entries(categories)) {
        caption += `▄▄▄▄▄ ${category.toUpperCase()} ▄▄▄▄▄\n`;
        
        categoryCommands.forEach(cmd => {
            const paddedName = cmd.name.padEnd(15, ' ');
            caption += `│ 🎯 ${paddedName} │ ${cmd.description}\n`;
        });
        
        caption += `▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\n\n`;
    }

    // Page navigation
    if (totalPages > 1) {
        caption += `📄 Page ${currentPage + 1}/${totalPages}\n`;
        caption += `🔍 Use: menu ${currentPage + 1} for next page\n\n`;
    }

    caption += `💡 *How to use:*\n`;
    caption += `• Type command name to use\n`;
    caption += `• help [command] for details\n`;
    caption += `• Example: help weather\n\n`;
    
    caption += `🎯 *Quick Examples:*\n`;
    caption += `• weather London\n`;
    caption += `• currency 100 USD EUR\n`;
    caption += `• instagram [url]\n`;
    caption += `• tictactoe\n\n`;
    
    caption += `⭐ Enjoy using Savy DNI X!`;

    return caption;
}

function createTextMenu(commands, currentPage, totalPages, totalCommands) {
    let menu = `╔══════════════════════════════════╗\n`;
    menu += `║        🚀 SAVY DNI X BOT 🚀       ║\n`;
    menu += `║        🤖 COMMAND MENU 🤖         ║\n`;
    menu += `╚══════════════════════════════════╝\n\n`;
    
    menu += `📋 *Total Commands: ${totalCommands}*\n\n`;

    // Create ASCII boxes for commands
    commands.forEach((cmd, index) => {
        if (index % 2 === 0) {
            menu += `╭──────────────────────────────╮\n`;
        }
        
        menu += `│ 🎯 ${cmd.name.padEnd(12)} │ ${cmd.description}\n`;
        
        if (index % 2 === 1 || index === commands.length - 1) {
            menu += `╰──────────────────────────────╯\n`;
        }
    });

    // Page navigation
    if (totalPages > 1) {
        menu += `\n📄 Page ${currentPage + 1}/${totalPages}`;
        menu += `\n🔍 Next: menu ${currentPage + 1}\n`;
    }

    menu += `\n💡 Use: help [command] for details`;
    menu += `\n⭐ Example: help weather`;

    return menu;
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}