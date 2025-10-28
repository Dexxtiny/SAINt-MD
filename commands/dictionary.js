import axios from "axios";

export default {
    name: "dic",
    description: "Get word definitions and meanings",
    category: "education",
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // Check if a word was provided
            if (!args || args.length === 0) {
                await client.sendMessage(message.key.remoteJid, { 
                    text: '❌ Please provide a word to look up.\n\nExample: !dic hello' 
                }, { 
                    quoted: message 
                });
                return;
            }
            
            const word = args[0].toLowerCase();
            
            // Fetch word definition from free Dictionary API
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const wordData = response.data[0];
            
            // Format the response
            const formattedResponse = formatDictionaryResponse(word, wordData);
            
            // Send the definition
            await client.sendMessage(message.key.remoteJid, { 
                text: formattedResponse 
            }, { 
                quoted: message 
            });
            
        } catch (error) {
            console.error('Error executing dictionary command:', error);
            
            if (error.response && error.response.status === 404) {
                // Word not found
                await client.sendMessage(message.key.remoteJid, { 
                    text: `❌ Word "${args[0]}" not found in the dictionary.\n\nPlease check the spelling or try another word.` 
                }, { 
                    quoted: message 
                });
            } else {
                // Other errors
                await client.sendMessage(message.key.remoteJid, { 
                    text: '❌ Error fetching word definition. Please try again later.' 
                }, { 
                    quoted: message 
                });
            }
        }
    }
};

// Format the dictionary response with ASCII art
function formatDictionaryResponse(word, wordData) {
    const wordUpper = word.charAt(0).toUpperCase() + word.slice(1);
    const phonetic = wordData.phonetic || wordData.phonetics.find(p => p.text)?.text || '';
    
    let response = `
╔══════════════════════════════════════╗
║             📚 DICTIONARY 📚        ║
╠══════════════════════════════════════╣
║                                      ║
║  Word: ${wordUpper}${' '.repeat(33 - wordUpper.length)}║
║  ${phonetic ? `Phonetic: ${phonetic}${' '.repeat(27 - phonetic.length)}║` : ''}
║                                      ║
    `.trim();

    // Add meanings
    wordData.meanings.slice(0, 3).forEach(meaning => {
        response += `\n║  📍 ${meaning.partOfSpeech.toUpperCase()}${' '.repeat(33 - meaning.partOfSpeech.length)}║`;
        
        // Add definitions (limit to 3 per part of speech)
        meaning.definitions.slice(0, 3).forEach((def, index) => {
            const definition = def.definition.length > 35 
                ? def.definition.substring(0, 32) + '...' 
                : def.definition;
                
            response += `\n║  ${index + 1}. ${definition}${' '.repeat(35 - definition.length)}║`;
            
            // Add example if available
            if (def.example) {
                const example = def.example.length > 35 
                    ? def.example.substring(0, 32) + '...' 
                    : def.example;
                    
                response += `\n║     Example: ${example}${' '.repeat(25 - example.length)}║`;
            }
        });
        
        response += `\n║                                      ║`;
    });
    
    response += `
║                                      ║
║  Source: DictionaryAPI.dev           ║
║  Use !dic <word> for more definitions║
║                                      ║
╚══════════════════════════════════════╝
    `.trim();

    return response;
}