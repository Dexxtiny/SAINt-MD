import axios from "axios";

export default {
    name: "tiktok",
    description: "Download TikTok videos without watermark",
    category: "download",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length === 0) {
                await client.sendMessage(chatId, {
                    text: `🎵 *TIKTOK DOWNLOADER*\n\nDownload TikTok videos without watermark!\n\nUsage:\n• tiktok [TikTok URL]\n• Reply to a TikTok link with: tiktok\n\nExamples:\n• tiktok https://vm.tiktok.com/abc123/\n• tiktok https://www.tiktok.com/@user/video/123456\n\n📱 Supports:\n• Video downloads (no watermark)\n• Audio extraction\n• Video information`
                }, { quoted: message });
                return;
            }

            const url = args[0];
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedText = quotedMessage?.extendedTextMessage?.text || quotedMessage?.conversation;
            
            // Get URL from args or quoted message
            let tiktokUrl = url;
            if (quotedText && isTikTokUrl(quotedText)) {
                tiktokUrl = quotedText;
            }

            if (!isTikTokUrl(tiktokUrl)) {
                await client.sendMessage(chatId, {
                    text: "❌ Please provide a valid TikTok URL!\n\nExample: tiktok https://vm.tiktok.com/abc123/"
                }, { quoted: message });
                return;
            }

            await client.sendMessage(chatId, {
                text: "⏬ Downloading TikTok video... This may take a moment."
            }, { quoted: message });

            // Download TikTok video
            const tiktokData = await downloadTikTok(tiktokUrl);

            if (!tiktokData || !tiktokData.videoUrl) {
                throw new Error('Failed to download TikTok');
            }

            // Download the video
            const videoResponse = await axios.get(tiktokData.videoUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.tiktok.com/'
                }
            });

            const videoBuffer = Buffer.from(videoResponse.data);

            // Create caption with video info
            let caption = `🎵 *TIKTOK DOWNLOAD*\n\n`;
            
            if (tiktokData.author) {
                caption += `👤 *Author:* ${tiktokData.author}\n`;
            }
            
            if (tiktokData.title) {
                caption += `📝 *Description:* ${tiktokData.title}\n`;
            }
            
            if (tiktokData.duration) {
                caption += `⏱️ *Duration:* ${tiktokData.duration}s\n`;
            }
            
            caption += `\n📥 Downloaded via Savy DNI X`;

            // Send video
            await client.sendMessage(chatId, {
                video: videoBuffer,
                caption: caption,
                gifPlayback: false
            }, { quoted: message });

        } catch (error) {
            console.error('TikTok download error:', error);
            
            let errorMessage = "❌ Failed to download TikTok video. ";
            
            if (error.response?.status === 404) {
                errorMessage += "Video not found or private.";
            } else if (error.response?.status === 403) {
                errorMessage += "Access denied. TikTok might be blocking requests.";
            } else if (error.code === 'ECONNABORTED') {
                errorMessage += "Download timeout. Try again.";
            } else {
                errorMessage += "The video might be too long or the link is invalid.";
            }

            await client.sendMessage(chatId, {
                text: errorMessage
            }, { quoted: message });
        }
    }
};

async function downloadTikTok(url) {
    try {
        // Use TikWM API or similar service
        const response = await axios.get(`https://api.tiklydown.eu.org/api/download`, {
            params: {
                url: url
            },
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        
        if (data.videoUrl || data.videos) {
            return {
                videoUrl: data.videoUrl || data.videos[0],
                author: data.author?.nickname || data.author,
                title: data.title || data.desc,
                duration: data.duration
            };
        }
        
        throw new Error('No video URL in response');

    } catch (error) {
        console.error('TikTok API error:', error);
        
        // Fallback to alternative API
        return await fallbackTikTokDownload(url);
    }
}

async function fallbackTikTokDownload(url) {
    try {
        const response = await axios.get(`https://api.tiktokdownload.online/tiktok/info`, {
            params: {
                url: url
            },
            timeout: 30000
        });

        const data = response.data;
        
        if (data.video_url) {
            return {
                videoUrl: data.video_url,
                author: data.author_name,
                title: data.title,
                duration: data.duration
            };
        }
        
        throw new Error('Fallback API also failed');

    } catch (fallbackError) {
        console.error('Fallback TikTok API error:', fallbackError);
        
        // Second fallback
        const secondResponse = await axios.get(`https://www.tikwm.com/api/`, {
            params: {
                url: url
            },
            timeout: 30000
        });

        const secondData = secondResponse.data;
        
        if (secondData.data && secondData.data.play) {
            return {
                videoUrl: secondData.data.play,
                author: secondData.data.author?.nickname,
                title: secondData.data.title,
                duration: secondData.data.duration
            };
        }
        
        throw new Error('All TikTok APIs failed');
    }
}

function isTikTokUrl(url) {
    const tiktokPatterns = [
        /https?:\/\/(vm|vt)\.tiktok\.com\/.+/,
        /https?:\/\/(www\.)?tiktok\.com\/@.+\/video\/.+/,
        /https?:\/\/(www\.)?tiktok\.com\/t\/.+/,
        /https?:\/\/tiktok\.com\/@.+\/video\/.+/
    ];
    
    return tiktokPatterns.some(pattern => pattern.test(url));
}