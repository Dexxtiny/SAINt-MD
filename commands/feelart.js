import axios from "axios";

export default {
    name: "feelart",
    description: "Convert your feelings and text into beautiful AI artwork",
    category: "art",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length === 0) {
                await client.sendMessage(chatId, {
                    text: `🎨 *FEELART - EMOTIONAL AI ART*\n\nTurn your feelings into beautiful artwork!\n\nUsage: feelart [your feelings/thoughts]\n\nExamples:\n• feelart I feel happy and free like a bird\n• feelart Heartbroken and lonely in the rain\n• feelart Excited for new beginnings and opportunities\n• feelart Peaceful and calm like ocean waves\n\n🎭 *Art Styles:*\n• Emotional & mood-based\n• Color psychology applied\n• Symbolic imagery\n• Personalized to your words`
                }, { quoted: message });
                return;
            }

            const text = args.join(" ");
            
            await client.sendMessage(chatId, {
                text: "🎨 Analyzing your feelings and creating emotional artwork... This may take 20-30 seconds."
            }, { quoted: message });

            // Generate emotional artwork
            const imageBuffer = await generateEmotionalArt(text);

            if (!imageBuffer) {
                throw new Error('Failed to generate artwork');
            }

            // Analyze emotion from text
            const emotion = analyzeEmotion(text);
            const artStyle = getArtStyle(emotion);

            await client.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🎨 *FEELART GENERATED*\n\n💭 Your Words: "${text}"\n😊 Emotion: ${emotion}\n🎨 Style: ${artStyle}\n\n✨ Your feelings transformed into art!`
            }, { quoted: message });

        } catch (error) {
            console.error('Feelart error:', error);
            await client.sendMessage(chatId, {
                text: "❌ Failed to create emotional artwork. The AI might be busy. Please try again with different words."
            }, { quoted: message });
        }
    }
};

async function generateEmotionalArt(text) {
    try {
        // Analyze emotion and create appropriate prompt
        const emotion = analyzeEmotion(text);
        const artPrompt = createArtPrompt(text, emotion);
        
        // Use AI image generation API
        const response = await axios.post(
            "https://api.vyro.ai/v1/ai/art",
            {
                prompt: artPrompt,
                style: getArtStyle(emotion),
                width: 512,
                height: 512,
                guidance: 7.5,
                steps: 30
            },
            {
                responseType: 'arraybuffer',
                timeout: 45000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        return Buffer.from(response.data);

    } catch (error) {
        console.error('Art generation API error:', error);
        
        // Fallback to alternative AI service
        return await fallbackArtGeneration(text);
    }
}

function analyzeEmotion(text) {
    const lowerText = text.toLowerCase();
    
    // Emotional analysis
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || 
        lowerText.includes('love') || lowerText.includes('amazing') || lowerText.includes('wonderful')) {
        return 'Happy';
    }
    
    if (lowerText.includes('sad') || lowerText.includes('heartbroken') || lowerText.includes('cry') || 
        lowerText.includes('lonely') || lowerText.includes('depressed') || lowerText.includes('miss')) {
        return 'Sad';
    }
    
    if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('hate') || 
        lowerText.includes('frustrated') || lowerText.includes('annoyed')) {
        return 'Angry';
    }
    
    if (lowerText.includes('peaceful') || lowerText.includes('calm') || lowerText.includes('relax') || 
        lowerText.includes('serene') || lowerText.includes('tranquil')) {
        return 'Peaceful';
    }
    
    if (lowerText.includes('scared') || lowerText.includes('afraid') || lowerText.includes('anxious') || 
        lowerText.includes('nervous') || lowerText.includes('worried')) {
        return 'Anxious';
    }
    
    if (lowerText.includes('motivated') || lowerText.includes('inspired') || lowerText.includes('powerful') || 
        lowerText.includes('strong') || lowerText.includes('determined')) {
        return 'Motivated';
    }
    
    if (lowerText.includes('confused') || lowerText.includes('lost') || lowerText.includes('uncertain') || 
        lowerText.includes('unsure')) {
        return 'Confused';
    }
    
    return 'Neutral';
}

function createArtPrompt(text, emotion) {
    const basePrompts = {
        'Happy': `Beautiful, vibrant, colorful digital art representing happiness and joy. ${text}. Bright colors, warm lighting, smiling elements, celebration, euphoric atmosphere, masterpiece, highly detailed, emotional art`,
        'Sad': `Emotional, melancholic, moody artwork representing sadness. ${text}. Blue tones, rain, tears, lonely scenes, emotional depth, atmospheric, cinematic lighting, soulful, artistic`,
        'Angry': `Intense, dramatic, powerful art representing anger and frustration. ${text}. Red colors, fire, storms, explosive energy, dynamic composition, bold strokes, emotional intensity`,
        'Peaceful': `Serene, calm, tranquil artwork representing peace. ${text}. Soft colors, nature, water, gentle lighting, harmonious composition, meditative, soothing atmosphere`,
        'Anxious': `Surreal, tense, atmospheric art representing anxiety. ${text}. Dark tones, confusion, maze-like elements, surreal composition, psychological depth, emotional turmoil`,
        'Motivated': `Inspirational, powerful, uplifting artwork representing motivation. ${text}. Golden light, mountains, sunrise, achievement, powerful composition, hopeful atmosphere`,
        'Confused': `Abstract, surreal, mysterious art representing confusion. ${text}. Mixed colors, maze, fog, uncertain paths, dreamlike, thought-provoking composition`,
        'Neutral': `Artistic, balanced, thoughtful artwork. ${text}. Neutral colors, contemplative mood, abstract elements, emotional depth, creative expression`
    };

    return basePrompts[emotion] || basePrompts['Neutral'];
}

function getArtStyle(emotion) {
    const styles = {
        'Happy': 'digital art, vibrant, cartoonish, happy style',
        'Sad': 'watercolor, melancholic, artistic, emotional',
        'Angry': 'expressionist, bold, dramatic, intense',
        'Peaceful': 'soft, dreamy, pastel, serene',
        'Anxious': 'surreal, abstract, psychological, dark',
        'Motivated': 'inspirational, bold, heroic, powerful',
        'Confused': 'abstract, surreal, mysterious, thought-provoking',
        'Neutral': 'artistic, balanced, contemporary, emotional'
    };

    return styles[emotion] || 'artistic, emotional, detailed';
}

async function fallbackArtGeneration(text) {
    try {
        // Alternative AI art service
        const response = await axios.get(
            `https://ai-art-generator.com/api/generate?text=${encodeURIComponent(text)}&style=emotional`,
            {
                responseType: 'arraybuffer',
                timeout: 40000
            }
        );

        return Buffer.from(response.data);
    } catch (fallbackError) {
        console.error('Fallback art generation failed:', fallbackError);
        return null;
    }
}