import axios from "axios";

const OPENWEATHER_API_KEY = "15dc1b7587fc3611413d051d0c29d590";

export default {
    name: "weather",
    description: "Get current weather information for any city",
    category: "utility",
    
    async execute(message, client, args) {
        try {
            if (!args || args.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `🌤️ *WEATHER FORECAST*\n\nGet current weather for any city!\n\nUsage: weather [city name]\n\nExamples:\n• weather London\n• weather New York\n• weather Tokyo\n• weather Lagos\n• weather Paris with metric`,
                    },
                    { quoted: message }
                );
                return;
            }

            const city = args.join(" ");
            
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get weather data from OpenWeather
            const weatherData = await getWeatherData(city);

            if (!weatherData) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `❌ Could not find weather data for "${city}".\n\nPlease check the city name and try again.`,
                    },
                    { quoted: message }
                );
                return;
            }

            const weatherMessage = `
${getWeatherArt(weatherData.weather[0].main)}

🌍 *WEATHER IN ${weatherData.name.toUpperCase()}*

🌡️ Temperature: ${weatherData.main.temp}°C
💧 Humidity: ${weatherData.main.humidity}%
💨 Wind: ${weatherData.wind.speed} m/s
☁️ Condition: ${weatherData.weather[0].description}
👀 Feels like: ${weatherData.main.feels_like}°C
📊 Pressure: ${weatherData.main.pressure} hPa

📍 Country: ${weatherData.sys.country}
            `.trim();

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: weatherMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing weather command:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: "❌ Error fetching weather data. Please try again with a different city name.",
                },
                { quoted: message }
            );
        }
    },
};

// Get weather data from OpenWeather API
async function getWeatherData(city) {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${OPENWEATHER_API_KEY}`,
            {
                timeout: 15000
            }
        );

        return response.data;
        
    } catch (error) {
        console.error('OpenWeather API error:', error.response?.data || error.message);
        return null;
    }
}

// Get appropriate ASCII art based on weather condition
function getWeatherArt(weatherCondition) {
    const weatherArts = {
        'Clear': '☀️ ━━━━━━━━━━━━━━━━━ ☀️',
        'Clouds': '☁️ ━━━━━━━━━━━━━━━━━ ☁️',
        'Rain': '🌧️ ━━━━━━━━━━━━━━━━━ 🌧️',
        'Drizzle': '🌦️ ━━━━━━━━━━━━━━━━━ 🌦️',
        'Thunderstorm': '⛈️ ━━━━━━━━━━━━━━━━━ ⛈️',
        'Snow': '❄️ ━━━━━━━━━━━━━━━━━ ❄️',
        'Mist': '🌫️ ━━━━━━━━━━━━━━━━━ 🌫️',
        'Fog': '🌁 ━━━━━━━━━━━━━━━━━ 🌁'
    };

    return weatherArts[weatherCondition] || '🌤️ ━━━━━━━━━━━━━━━━━ 🌤️';
}