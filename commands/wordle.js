// Store active Wordle games
const wordleGames = new Map();

// List of 5-letter words for the game
const wordList = [
    'APPLE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH', 'FLAME', 'GRAPE', 'HOUSE',
    'IGLOO', 'JUICE', 'KNIFE', 'LIGHT', 'MAGIC', 'NIGHT', 'OCEAN', 'PIANO',
    'QUEEN', 'RIVER', 'SMILE', 'TIGER', 'UMBRA', 'VOICE', 'WATER', 'YOUTH',
    'ZEBRA', 'ALBUM', 'BEACH', 'CHESS', 'DANCE', 'EAGLE', 'FRUIT', 'GHOST',
    'HONEY', 'IVORY', 'JELLY', 'KOALA', 'LEMON', 'MONEY', 'NINJA', 'OLIVE',
    'PEARL', 'QUILT', 'ROBOT', 'SNAKE', 'TULIP', 'ULTRA', 'VIXEN', 'WHALE',
    'XENON', 'YACHT', 'ZESTY', 'ANGEL', 'BERRY', 'CANDY', 'DEVIL', 'EMBER',
    'FAIRY', 'GIANT', 'HEART', 'IMAGE', 'JOKER', 'KARMA', 'LLAMA', 'MUMMY',
    'NYMPH', 'OPERA', 'PIZZA', 'QUACK', 'ROYAL', 'STORM', 'TRUTH', 'UNITY',
    'VIVID', 'WITCH', 'XEROX', 'YOGUR', 'ZIPPY'
];

export default {
    name: "wordle",
    description: "Play Wordle - guess the 5-letter word",
    category: "games",
    
    async execute(message, client, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;

            if (args[0]?.toLowerCase() === 'end') {
                if (wordleGames.has(chatId)) {
                    const game = wordleGames.get(chatId);
                    await client.sendMessage(chatId, {
                        text: `🎯 *WORDLE ENDED*\n\nThe word was: *${game.targetWord}*\n\nPlay again: wordle`
                    }, { quoted: message });
                    wordleGames.delete(chatId);
                }
                return;
            }

            if (args[0]?.toLowerCase() === 'hint') {
                const game = wordleGames.get(chatId);
                if (game) {
                    const hint = getHint(game.targetWord, game.guesses);
                    await client.sendMessage(chatId, {
                        text: `💡 *HINT*: ${hint}\n\nGuesses left: ${6 - game.guesses.length}`
                    }, { quoted: message });
                }
                return;
            }

            // Check if there's an active game
            const game = wordleGames.get(chatId);
            if (game) {
                return handleWordleGuess(game, chatId, userId, args[0], client, message);
            }

            // Start new game
            await client.sendMessage(chatId, {
                text: `🎯 *WORDLE GAME* 🎯\n\nGuess the 5-letter word in 6 tries!\n\nAfter each guess, you'll see:\n🟩 = Correct letter & position\n🟨 = Correct letter, wrong position\n⬜ = Letter not in word\n\n*Commands:*\n• wordle [5-letter word] - Make a guess\n• wordle hint - Get a hint\n• wordle end - End current game\n\n*Example:* wordle APPLE\n\nGood luck! 🍀`
            }, { quoted: message });

            // Initialize new game
            startNewWordleGame(chatId, userId, client);

        } catch (error) {
            console.error('Wordle error:', error);
            await client.sendMessage(message.key.remoteJid, {
                text: "❌ Game error occurred. Please try again."
            }, { quoted: message });
        }
    }
};

function startNewWordleGame(chatId, userId, client) {
    const targetWord = wordList[Math.floor(Math.random() * wordList.length)];
    
    const game = {
        targetWord: targetWord,
        player: userId,
        guesses: [],
        gameActive: true,
        startTime: Date.now()
    };
    
    wordleGames.set(chatId, game);
}

async function handleWordleGuess(game, chatId, userId, guess, client, message) {
    if (!game.gameActive) {
        wordleGames.delete(chatId);
        return;
    }

    if (!guess || guess.length !== 5) {
        await client.sendMessage(chatId, {
            text: "❌ Please enter a 5-letter word!\nExample: wordle APPLE"
        }, { quoted: message });
        return;
    }

    const upperGuess = guess.toUpperCase();
    
    // Validate word exists in word list
    if (!wordList.includes(upperGuess)) {
        await client.sendMessage(chatId, {
            text: `❌ "${upperGuess}" is not in the word list!\nTry a different 5-letter word.`
        }, { quoted: message });
        return;
    }

    // Process the guess
    game.guesses.push(upperGuess);
    const result = checkWordleGuess(upperGuess, game.targetWord);
    
    // Check for win
    if (upperGuess === game.targetWord) {
        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        
        await client.sendMessage(chatId, {
            text: `🎉 *WORDLE SOLVED!* 🎉\n\n${displayWordleBoard(game.guesses, game.targetWord)}\n\n*Word:* ${game.targetWord}\n*Guesses:* ${game.guesses.length}/6\n*Time:* ${minutes}m ${seconds}s\n\n🏆 Amazing job! Play again: wordle`
        }, { quoted: message });
        wordleGames.delete(chatId);
        return;
    }

    // Check for game over
    if (game.guesses.length >= 6) {
        await client.sendMessage(chatId, {
            text: `💀 *GAME OVER* 💀\n\n${displayWordleBoard(game.guesses, game.targetWord)}\n\nThe word was: *${game.targetWord}*\n\nBetter luck next time! Play again: wordle`
        }, { quoted: message });
        wordleGames.delete(chatId);
        return;
    }

    // Continue game
    await client.sendMessage(chatId, {
        text: `🎯 *Guess ${game.guesses.length}/6*\n\n${displayWordleBoard(game.guesses, game.targetWord)}\n\nNext guess: wordle [5-letter word]`
    }, { quoted: message });
}

function checkWordleGuess(guess, target) {
    const result = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    
    // First pass: find correct positions (green)
    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
            result.push('🟩');
            targetLetters[i] = null; // Mark as used
        } else {
            result.push(null);
        }
    }
    
    // Second pass: find correct letters wrong position (yellow)
    for (let i = 0; i < 5; i++) {
        if (result[i] === '🟩') continue;
        
        const foundIndex = targetLetters.indexOf(guessLetters[i]);
        if (foundIndex !== -1) {
            result[i] = '🟨';
            targetLetters[foundIndex] = null; // Mark as used
        } else {
            result[i] = '⬜';
        }
    }
    
    return result.join(' ');
}

function displayWordleBoard(guesses, targetWord) {
    let board = '';
    
    for (const guess of guesses) {
        const result = checkWordleGuess(guess, targetWord);
        board += `${result}\n`;
    }
    
    // Add empty rows for remaining guesses
    const remaining = 6 - guesses.length;
    for (let i = 0; i < remaining; i++) {
        board += '⬜ ⬜ ⬜ ⬜ ⬜\n';
    }
    
    return board.trim();
}

function getHint(targetWord, guesses) {
    const revealedLetters = new Set();
    
    // Add letters from previous guesses that are in correct position
    for (const guess of guesses) {
        for (let i = 0; i < 5; i++) {
            if (guess[i] === targetWord[i]) {
                revealedLetters.add(`${i + 1}${guess[i]}`);
            }
        }
    }
    
    if (revealedLetters.size > 0) {
        const hints = Array.from(revealedLetters);
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        return `Position ${randomHint[0]} is "${randomHint[1]}"`;
    }
    
    // If no correct positions, reveal a random correct letter
    const correctLetters = [];
    for (const guess of guesses) {
        for (let i = 0; i < 5; i++) {
            if (targetWord.includes(guess[i]) && !correctLetters.includes(guess[i])) {
                correctLetters.push(guess[i]);
            }
        }
    }
    
    if (correctLetters.length > 0) {
        const letter = correctLetters[Math.floor(Math.random() * correctLetters.length)];
        return `The word contains "${letter}"`;
    }
    
    // Final fallback hint
    return `The word starts with "${targetWord[0]}"`;
}