import axios from "axios";

export default {
    name: "removebg",
    description: "Remove background from images using AI",
    category: "image",
    
    async execute(message, client, args) {
        const chatId = message.key.remoteJid;
        
        try {
            await client.sendPresenceUpdate("composing", chatId);

            // Check if user sent an image
            if (message.message?.imageMessage) {
                return await removeBGFromImageMessage(client, chatId, message, args[0]);
            }
            // Check if user quoted an image
            else if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                return await removeBGFromQuotedImage(client, chatId, message, args[0]);
            }
            // Check if user provided URL
            else if (args[0]?.startsWith('http')) {
                return await removeBGFromURL(client, chatId, message, args[0], args[1]);
            }
            else if (args[0] === 'methods') {
                return await showMethods(client, chatId, message);
            }
            else {
                return await showHelp(client, chatId, message);
            }

        } catch (error) {
            console.error('RemoveBG error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Error removing background. Please try again with a different image."
            }, { quoted: message });
        }
    }
};

async function removeBGFromImageMessage(client, chatId, message, method = 'ai') {
    try {
        await client.sendMessage(chatId, {
            text: "🔄 Downloading and processing your image..."
        }, { quoted: message });

        // Download the image
        const imageBuffer = await client.downloadMediaMessage(message);
        
        if (!imageBuffer) {
            throw new Error('Failed to download image');
        }

        // Upload to free image hosting to get URL
        const imageUrl = await uploadImageToHosting(imageBuffer);
        
        if (!imageUrl) {
            // Fallback to base64 if upload fails
            return await removeBGWithBase64(client, chatId, imageBuffer, method, message);
        }

        // Remove background using URL method
        const response = await axios.get(
            `https://sniper-api-removebg.onrender.com/api/remove-bg/url?url=${encodeURIComponent(imageUrl)}&method=${method}`,
            {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        await handleRemoveBGResponse(client, chatId, response.data, message);

    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
}

async function removeBGFromQuotedImage(client, chatId, message, method = 'ai') {
    try {
        const quotedMessage = message.message.extendedTextMessage.contextInfo.quotedMessage;
        
        await client.sendMessage(chatId, {
            text: "🔄 Processing quoted image..."
        }, { quoted: message });

        // Download the quoted image
        const imageBuffer = await client.downloadMediaMessage({
            ...message,
            message: quotedMessage
        });

        if (!imageBuffer) {
            throw new Error('Failed to download quoted image');
        }

        // Upload to get URL
        const imageUrl = await uploadImageToHosting(imageBuffer);
        
        if (!imageUrl) {
            return await removeBGWithBase64(client, chatId, imageBuffer, method, message);
        }

        const response = await axios.get(
            `https://sniper-api-removebg.onrender.com/api/remove-bg/url?url=${encodeURIComponent(imageUrl)}&method=${method}`,
            {
                timeout: 30000
            }
        );

        await handleRemoveBGResponse(client, chatId, response.data, message);

    } catch (error) {
        console.error('Quoted image processing error:', error);
        throw error;
    }
}

async function removeBGFromURL(client, chatId, message, imageUrl, method = 'ai') {
    try {
        await client.sendMessage(chatId, {
            text: "🔄 Processing image from URL..."
        }, { quoted: message });

        const response = await axios.get(
            `https://sniper-api-removebg.onrender.com/api/remove-bg/url?url=${encodeURIComponent(imageUrl)}&method=${method}`,
            {
                timeout: 30000
            }
        );

        await handleRemoveBGResponse(client, chatId, response.data, message);

    } catch (error) {
        console.error('URL processing error:', error);
        throw error;
    }
}

async function removeBGWithBase64(client, chatId, imageBuffer, method, message) {
    try {
        await client.sendMessage(chatId, {
            text: "📤 Using alternative method..."
        }, { quoted: message });

        // Convert to base64
        const base64Image = imageBuffer.toString('base64');
        
        const response = await axios.post(
            "https://sniper-api-removebg.onrender.com/api/remove-bg",
            {
                image: base64Image,
                method: method || 'ai'
            },
            {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        await handleRemoveBGResponse(client, chatId, response.data, message);

    } catch (error) {
        console.error('Base64 processing error:', error);
        throw error;
    }
}

async function handleRemoveBGResponse(client, chatId, responseData, originalMessage) {
    if (!responseData.success) {
        throw new Error(responseData.error || 'Background removal failed');
    }

    const { image, format, method, size, attribution } = responseData.data;

    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Send the processed image
    await client.sendMessage(chatId, {
        image: imageBuffer,
        caption: `✅ *Background Removed Successfully!*\n\n📊 *Details:*\n• Format: ${format.toUpperCase()}\n• Method: ${method}\n• Size: ${(size / 1024).toFixed(2)} KB\n• ${attribution || 'Powered by AI'}\n\n💡 *Tip:* Send another image to remove background!`
    }, { quoted: originalMessage });

    // Send success reaction
    await client.sendMessage(chatId, {
        react: {
            text: "✅",
            key: originalMessage.key
        }
    });
}

async function uploadImageToHosting(imageBuffer) {
    try {
        // Try multiple free image hosting services
        const services = [
            {
                name: 'tmpfiles',
                url: 'https://tmpfiles.org/api/v1/upload',
                formData: { file: imageBuffer },
                processor: (data) => data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/')
            },
            {
                name: 'file.io',
                url: 'https://file.io',
                formData: { file: imageBuffer },
                processor: (data) => data.link
            }
        ];

        for (const service of services) {
            try {
                console.log(`Trying ${service.name}...`);
                const formData = new FormData();
                formData.append('file', imageBuffer, { filename: 'image.jpg' });

                const response = await axios.post(service.url, formData, {
                    timeout: 15000,
                    headers: {
                        ...formData.getHeaders?.(),
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.data && service.processor(response.data)) {
                    const imageUrl = service.processor(response.data);
                    console.log(`✅ Uploaded to ${service.name}: ${imageUrl}`);
                    return imageUrl;
                }
            } catch (error) {
                console.log(`${service.name} failed:`, error.message);
                continue;
            }
        }

        return null;
    } catch (error) {
        console.error('All image hosting failed:', error);
        return null;
    }
}

async function showMethods(client, chatId, message) {
    try {
        const response = await axios.get(
            "https://sniper-api-removebg.onrender.com/api/remove-bg/methods",
            { timeout: 10000 }
        );

        const methods = response.data.methods || [];
        
        let methodsText = `🎨 *Available Background Removal Methods:*\n\n`;
        
        methods.forEach(method => {
            methodsText += `• *${method.name}* - ${method.description}\n`;
        });

        methodsText += `\n💡 *Usage:*\n`;
        methodsText += `• Send image + method: removebg ai\n`;
        methodsText += `• Default method: AI-powered\n`;
        methodsText += `• Example: removebg threshold`;

        await client.sendMessage(chatId, {
            text: methodsText
        }, { quoted: message });

    } catch (error) {
        const methodsText = `
🎨 *Background Removal Methods:*\n
• *ai* 🤖 - AI-powered person segmentation (Default)
• *threshold* ⚡ - Brightness-based removal
• *color* 🎨 - Color range removal  
• *edge* 📐 - Edge detection based removal

💡 *Usage:*
• Just send an image for AI method
• removebg threshold - for brightness method
• removebg color - for color-based removal
• removebg edge - for edge detection
        `.trim();

        await client.sendMessage(chatId, {
            text: methodsText
        }, { quoted: message });
    }
}

async function showHelp(client, chatId, message) {
    const helpText = `
🎨 *BACKGROUND REMOVER* 🎨

*Remove backgrounds from images using AI*

📸 *How to use:*
1. *Send an image* with caption \`removebg\`
2. *Quote an image* and use \`removebg\`
3. *Use URL:* \`removebg https://image-url.com\`
4. *Specify method:* \`removebg threshold\`

🛠️ *Methods:*
• \`removebg\` - AI-powered (default)
• \`removebg threshold\` - Brightness-based
• \`removebg color\` - Color range removal
• \`removebg edge\` - Edge detection
• \`removebg methods\` - List all methods

📝 *Examples:*
• Just send an image with caption "removebg"
• \`removebg https://example.com/photo.jpg\`
• \`removebg color\` (then send image)
• Quote an image and reply "removebg"

⚡ *Powered by Sniper APIs*
    `.trim();

    await client.sendMessage(chatId, {
        text: helpText
    }, { quoted: message });
}