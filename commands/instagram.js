import axios from "axios";

export default {
    name: "instagram",
    description: "Download Instagram photos, videos, and reels",
    category: "download",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length === 0) {
                await client.sendMessage(chatId, {
                    text: `📷 *INSTAGRAM DOWNLOADER*\n\nDownload Instagram posts, reels, and stories!\n\nUsage:\n• instagram [Instagram URL]\n• Reply to an IG link with: instagram\n\nExamples:\n• instagram https://www.instagram.com/p/ABC123/\n• instagram https://instagram.com/reel/XYZ789/\n• instagram https://www.instagram.com/stories/username/123456/\n\n📱 *Supports:* Photos, Videos, Reels, Stories`
                }, { quoted: message });
                return;
            }

            const url = args[0];
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quotedMessage?.extendedTextMessage?.text || quotedMessage?.conversation;
            
            let instagramUrl = url;
            if (quotedText && isInstagramUrl(quotedText)) {
                instagramUrl = quotedText;
            }

            if (!isInstagramUrl(instagramUrl)) {
                await client.sendMessage(chatId, {
                    text: "❌ Please provide a valid Instagram URL!\n\nExample: instagram https://www.instagram.com/p/ABC123/"
                }, { quoted: message });
                return;
            }

            await client.sendMessage(chatId, {
                text: "⏬ Downloading from Instagram... This may take 15-20 seconds."
            }, { quoted: message });

            // Try multiple free APIs
            const instagramData = await downloadInstagramFree(instagramUrl);

            if (!instagramData || !instagramData.media) {
                throw new Error('All download methods failed');
            }

            let sentCount = 0;

            // Send each media item
            for (const media of instagramData.media.slice(0, 5)) { // Limit to 5 items
                try {
                    const mediaResponse = await axios.get(media.url, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://www.instagram.com/'
                        }
                    });

                    const mediaBuffer = Buffer.from(mediaResponse.data);

                    // Create caption for first item only
                    const caption = sentCount === 0 ? createCaption(instagramData) : '';

                    if (media.type === 'image') {
                        await client.sendMessage(chatId, {
                            image: mediaBuffer,
                            caption: caption
                        });
                    } else if (media.type === 'video') {
                        await client.sendMessage(chatId, {
                            video: mediaBuffer,
                            caption: caption
                        });
                    }

                    sentCount++;
                    
                    // Small delay between sends
                    if (sentCount < instagramData.media.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                } catch (mediaError) {
                    console.error(`Error sending media ${sentCount + 1}:`, mediaError);
                    continue;
                }
            }

            if (sentCount === 0) {
                throw new Error('All media downloads failed');
            }

        } catch (error) {
            console.error('Instagram download error:', error);
            
            await client.sendMessage(chatId, {
                text: "❌ Failed to download Instagram content. The post might be private, deleted, or too large. Try a different link!"
            }, { quoted: message });
        }
    }
};

async function downloadInstagramFree(url) {
    // Try multiple free APIs in sequence
    const apis = [
        trySnapSave,
        tryInstaDownloader,
        trySaveFrom,
        tryInstagramo
    ];

    for (const api of apis) {
        try {
            const result = await api(url);
            if (result && result.media && result.media.length > 0) {
                console.log(`Success with ${api.name}`);
                return result;
            }
        } catch (error) {
            console.log(`${api.name} failed:`, error.message);
            continue;
        }
    }
    
    return null;
}

async function trySnapSave(url) {
    // SnapSave.app - free Instagram downloader
    const response = await axios.get(`https://snapsave.app/info`, {
        params: { url: url },
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const data = response.data;
    if (data.data && data.data.length > 0) {
        return {
            media: data.data.map(item => ({
                url: item.url,
                type: item.type === 'image' ? 'image' : 'video'
            })),
            username: data.author?.username,
            caption: data.caption
        };
    }
    throw new Error('No media found');
}

async function tryInstaDownloader(url) {
    // instadownloader.net - free service
    const response = await axios.get(`https://instadownloader.net/api/index`, {
        params: { url: url },
        timeout: 15000
    });

    const data = response.data;
    if (data.media) {
        const media = Array.isArray(data.media) ? data.media : [data.media];
        return {
            media: media.map(item => ({
                url: item,
                type: item.includes('.mp4') ? 'video' : 'image'
            })),
            username: data.username,
            caption: data.caption
        };
    }
    throw new Error('No media found');
}

async function trySaveFrom(url) {
    // savefrom.net - popular downloader
    const response = await axios.get(`https://savefrom.net/api/convert`, {
        params: { url: url },
        timeout: 15000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    const data = response.data;
    if (data.url) {
        return {
            media: [{
                url: data.url,
                type: data.url.includes('.mp4') ? 'video' : 'image'
            }],
            username: 'Instagram',
            caption: data.meta?.title
        };
    }
    throw new Error('No media found');
}

async function tryInstagramo(url) {
    // instagramo - alternative free API
    const response = await axios.get(`https://instagramo.zammad.com/api/download`, {
        params: { url: url },
        timeout: 15000
    });

    const data = response.data;
    if (data.downloadUrl) {
        return {
            media: [{
                url: data.downloadUrl,
                type: data.downloadUrl.includes('.mp4') ? 'video' : 'image'
            }],
            username: data.author,
            caption: data.caption
        };
    }
    throw new Error('No media found');
}

function createCaption(data) {
    let caption = `📷 *INSTAGRAM DOWNLOAD*\n\n`;
    
    if (data.username) {
        caption += `👤 *Author:* @${data.username}\n`;
    }
    
    if (data.caption) {
        const shortCaption = data.caption.length > 100 ? 
            data.caption.substring(0, 100) + '...' : data.caption;
        caption += `📝 *Caption:* ${shortCaption}\n`;
    }
    
    caption += `\n📥 Downloaded via Savy DNI X`;
    
    return caption;
}

function isInstagramUrl(url) {
    const instagramPatterns = [
        /https?:\/\/(www\.)?instagram\.com\/(p|reel|stories|tv)\/.+/,
        /https?:\/\/(www\.)?instagram\.com\/.+?\/.+/
    ];
    
    return instagramPatterns.some(pattern => pattern.test(url));
}