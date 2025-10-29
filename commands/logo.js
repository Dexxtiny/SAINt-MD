import axios from "axios";

export default {
    name: "logo",
    description: "Generate professional logos from text",
    category: "design",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length === 0) {
                await client.sendMessage(chatId, {
                    text: `🎨 *LOGO GENERATOR*\n\nCreate professional logos from text!\n\nUsage: logo [text] [style]\n\nExamples:\n• logo MyBrand\n• logo Savy DNI X modern\n• logo TechCo minimal\n• logo Cafe vintage\n\n🎭 *Styles:*\n• modern - Clean & professional\n• minimal - Simple & elegant\n• vintage - Retro & classic\n• tech - Futuristic & digital\n• luxury - Premium & gold\n• fun - Colorful & playful\n• gaming - Gaming style\n• nature - Organic & natural\n\n💡 Add style after text for specific designs!`
                }, { quoted: message });
                return;
            }

            const text = args[0];
            const style = args[1]?.toLowerCase() || 'modern';

            if (text.length > 15) {
                await client.sendMessage(chatId, {
                    text: "❌ Text too long! Please use up to 15 characters for best logo results."
                }, { quoted: message });
                return;
            }

            await client.sendMessage(chatId, {
                text: "🎨 Designing your professional logo... This may take 15-20 seconds."
            }, { quoted: message });

            const logoBuffer = await generateLogo(text, style);

            if (!logoBuffer) {
                throw new Error('Logo generation failed');
            }

            await client.sendMessage(chatId, {
                image: logoBuffer,
                caption: `🎨 *LOGO GENERATED*\n\n📝 Text: ${text}\n🎭 Style: ${style}\n\n💡 Use this logo for your brand/business!`
            }, { quoted: message });

        } catch (error) {
            console.error('Logo command error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Failed to generate logo. Please try again with different text."
            }, { quoted: message });
        }
    }
};

async function generateLogo(text, style) {
    try {
        // Use logo generation API
        const response = await axios.post(
            "https://api.vyro.ai/v1/ai/logo",
            {
                text: text,
                style: getLogoStyle(style),
                color_scheme: getColorScheme(style),
                background: getBackground(style),
                quality: "high"
            },
            {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return Buffer.from(response.data);

    } catch (error) {
        console.error('Logo API error:', error);
        return await fallbackLogoGeneration(text, style);
    }
}

function getLogoStyle(style) {
    const styles = {
        'modern': 'modern, clean, professional, corporate, sleek',
        'minimal': 'minimalist, simple, elegant, clean, typography',
        'vintage': 'vintage, retro, classic, old school, distressed',
        'tech': 'futuristic, tech, digital, cyber, glowing',
        'luxury': 'luxury, premium, gold, elegant, sophisticated',
        'fun': 'colorful, playful, fun, cartoon, happy',
        'gaming': 'gaming, esports, bold, dynamic, extreme',
        'nature': 'organic, natural, eco, leaf, green'
    };
    
    return styles[style] || styles['modern'];
}

function getColorScheme(style) {
    const schemes = {
        'modern': 'blue, white, professional',
        'minimal': 'black, white, monochrome',
        'vintage': 'brown, sepia, warm',
        'tech': 'blue, purple, neon',
        'luxury': 'gold, black, premium',
        'fun': 'rainbow, colorful, vibrant',
        'gaming': 'red, black, intense',
        'nature': 'green, brown, natural'
    };
    
    return schemes[style] || schemes['modern'];
}

function getBackground(style) {
    const backgrounds = {
        'modern': 'transparent',
        'minimal': 'transparent',
        'vintage': 'textured',
        'tech': 'gradient',
        'luxury': 'dark',
        'fun': 'colorful',
        'gaming': 'dark',
        'nature': 'light'
    };
    
    return backgrounds[style] || 'transparent';
}

async function fallbackLogoGeneration(text, style) {
    try {
        // Alternative logo service
        const response = await axios.get(
            `https://logo.letscodepar.com/logo?text=${encodeURIComponent(text)}&style=${style}`,
            {
                responseType: 'arraybuffer',
                timeout: 25000
            }
        );

        return Buffer.from(response.data);
    } catch (fallbackError) {
        console.error('Fallback logo generation failed:', fallbackError);
        return null;
    }
}