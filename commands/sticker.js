import axios from "axios";
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default {
    name: "sticker",
    description: "Create stickers from images, videos, or text",
    category: "media",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            // Check for different sticker creation methods
            if (args[0]?.toLowerCase() === 'text') {
                return await createTextSticker(client, chatId, message, args.slice(1));
            }

            if (args[0]?.toLowerCase() === 'emoji') {
                return await createEmojiSticker(client, chatId, message, args.slice(1));
            }

            // Get media from quoted message or current message
            const mediaInfo = await getMediaFromMessage(client, message);
            
            if (mediaInfo) {
                return await createStickerFromMedia(client, chatId, message, mediaInfo, args);
            }

            // Show help
            await client.sendMessage(chatId, {
                text: `🖼️ *STICKER MAKER*\n\nCreate stickers from:\n\n📸 *From Image/Video:*\n• Reply to an image/video with: sticker\n• Send image/video with: sticker\n\n📝 *From Text:*\n• sticker text Hello World\n• sticker text Savy DNI X\n\n😊 *From Emoji:*\n• sticker emoji 😂\n• sticker emoji 🎉🔥\n\n🎨 *Options:*\n• sticker (adds default pack name)\n• sticker -nocrop (keeps original aspect)\n• sticker -author "Your Name" (custom author)`
            }, { quoted: message });

        } catch (error) {
            console.error('Sticker command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Failed to create sticker. Please make sure you're replying to an image/video or provide valid text/emoji."
            }, { quoted: message });
        }
    }
};

async function getMediaFromMessage(client, message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = quotedMessage || message.message;

        // Check for image
        if (targetMessage?.imageMessage) {
            const stream = await downloadContentFromMessage(targetMessage.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return {
                type: 'image',
                buffer: Buffer.concat(chunks),
                mimetype: targetMessage.imageMessage.mimetype
            };
        }

        // Check for video
        if (targetMessage?.videoMessage) {
            const stream = await downloadContentFromMessage(targetMessage.videoMessage, 'video');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return {
                type: 'video',
                buffer: Buffer.concat(chunks),
                mimetype: targetMessage.videoMessage.mimetype
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting media:', error);
        return null;
    }
}

async function createStickerFromMedia(client, chatId, message, mediaInfo, args) {
    try {
        await client.sendPresenceUpdate("composing", chatId);

        const options = parseStickerOptions(args);
        
        const sticker = new Sticker(mediaInfo.buffer, {
            pack: options.pack || 'Savy DNI X',
            author: options.author || 'Powered by Savy',
            type: options.crop ? StickerTypes.CROPPED : StickerTypes.FULL,
            categories: ['🤖', '🎨'],
            quality: 50,
        });

        const stickerBuffer = await sticker.toBuffer();

        await client.sendMessage(chatId, {
            sticker: stickerBuffer
        }, { quoted: message });

    } catch (error) {
        console.error('Sticker creation error:', error);
        throw error;
    }
}

async function createTextSticker(client, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, {
                text: "❌ Please provide text for the sticker!\n\nExample: sticker text Hello World"
            }, { quoted: message });
            return;
        }

        const text = args.join(' ');
        await client.sendPresenceUpdate("composing", chatId);

        // Create text sticker using canvas or API
        const stickerBuffer = await generateTextSticker(text);

        await client.sendMessage(chatId, {
            sticker: stickerBuffer
        }, { quoted: message });

    } catch (error) {
        console.error('Text sticker error:', error);
        throw error;
    }
}

async function createEmojiSticker(client, chatId, message, args) {
    try {
        if (!args || args.length === 0) {
            await client.sendMessage(chatId, {
                text: "❌ Please provide emoji(s) for the sticker!\n\nExample: sticker emoji 😂\nExample: sticker emoji 🎉🔥❤️"
            }, { quoted: message });
            return;
        }

        const emojis = args.join(' ');
        await client.sendPresenceUpdate("composing", chatId);

        // Create emoji sticker
        const stickerBuffer = await generateEmojiSticker(emojis);

        await client.sendMessage(chatId, {
            sticker: stickerBuffer
        }, { quoted: message });

    } catch (error) {
        console.error('Emoji sticker error:', error);
        throw error;
    }
}

async function generateTextSticker(text) {
    try {
        // Use API to generate text sticker
        const response = await axios.get(`https://api.erdwpe.com/api/maker/sticker?text=${encodeURIComponent(text)}`, {
            responseType: 'arraybuffer',
            timeout: 15000
        });

        return Buffer.from(response.data);
    } catch (error) {
        console.error('Text sticker API error:', error);
        
        // Fallback: Use another service
        const fallbackResponse = await axios.post('https://sticker-api.sanity.sh/create', {
            text: text,
            backgroundColor: '#FF69B4',
            textColor: '#FFFFFF'
        }, {
            responseType: 'arraybuffer',
            timeout: 15000
        });

        return Buffer.from(fallbackResponse.data);
    }
}

async function generateEmojiSticker(emojis) {
    try {
        // Use emoji sticker API
        const response = await axios.get(`https://emoji-api.com/sticker/${encodeURIComponent(emojis)}`, {
            responseType: 'arraybuffer',
            timeout: 15000
        });

        return Buffer.from(response.data);
    } catch (error) {
        console.error('Emoji sticker API error:', error);
        
        // Fallback: Convert emoji to image using another service
        const fallbackResponse = await axios.get(`https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/${getEmojiCode(emojis)}.svg`, {
            responseType: 'arraybuffer'
        });

        // Convert SVG to PNG for sticker
        const sticker = new Sticker(fallbackResponse.data, {
            pack: 'Savy DNI X',
            author: 'Emoji Sticker',
            type: StickerTypes.CROPPED,
            quality: 50
        });

        return await sticker.toBuffer();
    }
}

function getEmojiCode(emoji) {
    // Convert emoji to Unicode code points
    return Array.from(emoji)
        .map(char => char.codePointAt(0).toString(16))
        .join('-');
}

function parseStickerOptions(args) {
    const options = {
        pack: 'Savy DNI X',
        author: 'Powered by Savy',
        crop: true
    };

    args.forEach(arg => {
        if (arg === '-nocrop') options.crop = false;
        if (arg === '-author' && args[args.indexOf(arg) + 1]) {
            options.author = args[args.indexOf(arg) + 1];
        }
        if (arg === '-pack' && args[args.indexOf(arg) + 1]) {
            options.pack = args[args.indexOf(arg) + 1];
        }
    });

    return options;
}