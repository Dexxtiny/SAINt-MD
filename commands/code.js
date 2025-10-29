import axios from "axios";
import fs from 'fs';
import path from 'path';

export default {
    name: "code",
    description: "Generate HTML, CSS, or JS code from any prompt",
    category: "tools",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;

            if (!args || args.length < 2) {
                await client.sendMessage(chatId, {
                    text: `💻 *AI CODE GENERATOR*\n\nGenerate any HTML/CSS/JS code from your description!\n\nUsage:\n• code html a signup page with blue theme\n• code css a modern navbar with animations\n• code js a countdown timer with sound\n• code html a portfolio website\n• code css a responsive grid layout\n\nIf code is long, I'll send it as a downloadable file!`
                }, { quoted: message });
                return;
            }

            const type = args[0].toLowerCase();
            const prompt = args.slice(1).join(' ');

            if (!['html', 'css', 'js'].includes(type)) {
                await client.sendMessage(chatId, {
                    text: "❌ Invalid code type! Use: html, css, or js\n\nExample: code html a login form"
                }, { quoted: message });
                return;
            }

            await client.sendMessage(chatId, {
                text: `💻 Generating ${type.toUpperCase()} code for: "${prompt}"...`
            }, { quoted: message });

            // Use Blackbox AI API for code generation
            const generatedCode = await generateCodeWithAI(type, prompt);

            if (!generatedCode) {
                throw new Error('API returned no code');
            }

            // Determine file details
            const fileExt = type === 'html' ? 'html' : type === 'css' ? 'css' : 'js';
            const fileName = `generated-${type}-${Date.now()}.${fileExt}`;
            const mimeType = type === 'html' ? 'text/html' : type === 'css' ? 'text/css' : 'application/javascript';

            // If code is short, send as message
            if (generatedCode.length < 2000) {
                await client.sendMessage(chatId, {
                    text: `💻 *Generated ${type.toUpperCase()} Code*\n\n*Prompt:* ${prompt}\n\n\`\`\`${fileExt}\n${generatedCode}\n\`\`\`\n\n💡 Copy this code and save as .${fileExt} file to use!`
                }, { quoted: message });
            } else {
                // If code is long, send as file
                const tempDir = './temp_codes';
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const filePath = path.join(tempDir, fileName);
                fs.writeFileSync(filePath, generatedCode);
                
                const fileBuffer = fs.readFileSync(filePath);
                
                await client.sendMessage(chatId, {
                    document: fileBuffer,
                    fileName: fileName,
                    mimetype: mimeType,
                    caption: `💻 *Generated ${type.toUpperCase()} Code*\n\n*Prompt:* ${prompt}\n\nYour ${type} code is ready! Download and use in your project.`
                }, { quoted: message });
                
                // Clean up
                fs.unlinkSync(filePath);
            }

        } catch (error) {
            console.error('Code generation error:', error);
            await client.sendMessage(message.key.remoteJid, {
                text: "❌ Failed to generate code. The AI service might be busy. Please try again with a different prompt."
            }, { quoted: message });
        }
    }
};

async function generateCodeWithAI(type, prompt) {
    try {
        // Using Blackbox AI API for code generation
        const response = await axios.post('https://www.blackbox.ai/api/chat', {
            messages: [{
                role: 'user',
                content: `Generate ${type} code for: ${prompt}. Return only the pure ${type} code without any explanations, comments, or markdown formatting. Make it complete and ready to use.`
            }],
            id: 'code-generator',
            previewToken: null,
            userId: null,
            codeModelMode: true,
            agentMode: {},
            trendingAgentMode: {},
            isMicMode: false,
            isChromeExt: false,
            githubToken: null
        }, {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // Extract code from response
        let code = response.data;
        
        // Clean up the response to get pure code
        if (typeof code === 'string') {
            // Remove markdown code blocks if present
            code = code.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
            // Remove any explanatory text
            code = code.split('Here is')[0].split('Here\'s')[0].trim();
        }
        
        return code || null;

    } catch (error) {
        console.error('AI API error:', error);
        
        // Fallback: Use a different AI service
        return await fallbackAICodeGeneration(type, prompt);
    }
}

async function fallbackAICodeGeneration(type, prompt) {
    try {
        // Alternative: Use another free AI API
        const response = await axios.post('https://api.openai-script.com/generate', {
            prompt: `Create ${type} code for: ${prompt}. Return only the code without explanations.`,
            type: type
        }, {
            timeout: 20000
        });

        return response.data.code || null;
    } catch (fallbackError) {
        console.error('Fallback AI also failed:', fallbackError);
        return null;
    }
}