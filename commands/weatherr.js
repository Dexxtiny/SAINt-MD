import logger from "../utils/logger.js";
import fetch from "node-fetch";

export default {
    name: "weather",
    description: "Get current weather information for a location",
    category: "utility",

    async execute(message, client, args, db) {
        try {
            const chatId = message.key.remoteJid;
            await client.sendPresenceUpdate("composing", chatId);

            if (args.length < 1) {
                await client.sendMessage(
                    chatId,
                    { text: "❌ Please provide a location (e.g., Lagos, London, New York)." },
                    { quoted: message }
                );
                return;
            }

            const location = args.join(" ");

            // Example using OpenWeatherMap API (replace YOUR_API_KEY with actual key)
            const apiKey = process.env.OPENWEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("Weather API request failed");
            const data = await res.json();

            const temp = data.main.temp;
            const feelsLike = data.main.feels_like;
            const condition = data.weather[0].description;
            const humidity = data.main.humidity;
            const wind = data.wind.speed;

            const response = `
${getWeatherArt()}
🌦 *WEATHER REPORT*
${getWeatherArt()}

📍 Location: *${location}*  
🌡 Temperature: *${temp}°C* (feels like ${feelsLike}°C)  
☁ Condition: *${condition}*  
💧 Humidity: *${humidity}%*  
🌬 Wind: *${wind} km/h*  

⚡ Data provided by OpenWeatherMap

${getWeatherArt()}
            `.trim();

            await client.sendMessage(chatId, { text: response }, { quoted: message });

        } catch (error) {
            logger.error("Error executing weather command:", error);

            await client.sendMessage(
                message.key.remoteJid,
                { text: "❌ Error fetching weather data. Please try again later." },
                { quoted: message }
            );
        }
    },
};

function getWeatherArt() {
    const arts = [
        "✦━━━━━━━━━━━━━━━━━✦",
        "🌦─────────────────🌦",
        "⊱──────── ⚡ ────────⊰",
        "»»────── ✅ ──────««",
    ];
    return arts[Math.floor(Math.random() * arts.length)];
}
