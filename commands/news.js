import axios from "axios";

const NEWS_API_KEY = "ee43c2080bb84c7cba07ce232d291d0f";

export default {
    name: "news",
    description: "Get latest news headlines",
    category: "information",
    
    async execute(message, client, args) {
        try {
            const category = args[0]?.toLowerCase() || 'general';
            
            await client.sendPresenceUpdate("composing", message.key.remoteJid);

            // Get news from NewsAPI
            const response = await axios.get(
                `https://newsapi.org/v2/top-headlines`,
                {
                    params: {
                        country: 'us',
                        category: category,
                        pageSize: 5,
                        apiKey: NEWS_API_KEY
                    },
                    timeout: 15000
                }
            );

            const articles = response.data.articles;
            
            if (!articles || articles.length === 0) {
                await client.sendMessage(
                    message.key.remoteJid,
                    {
                        text: `❌ No news found for category: ${category}\n\nTry: general, business, technology, entertainment, sports, health, science`
                    },
                    { quoted: message }
                );
                return;
            }

            let newsMessage = `📰 *LATEST NEWS* (${category.toUpperCase()})\n\n`;
            
            articles.forEach((article, index) => {
                newsMessage += `*${index + 1}. ${article.title}*\n`;
                if (article.description) {
                    newsMessage += `${article.description}\n`;
                }
                if (article.source?.name) {
                    newsMessage += `📡 Source: ${article.source.name}\n`;
                }
                if (article.url) {
                    newsMessage += `🔗 Read more: ${article.url}\n`;
                }
                newsMessage += `\n`;
            });

            newsMessage += `💡 Use: news [category]\nCategories: general, business, tech, sports, health, science, entertainment`;

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: newsMessage,
                },
                { quoted: message }
            );

        } catch (error) {
            console.error('Error executing news command:', error);
            
            let errorMessage = "❌ Failed to fetch news. ";
            
            if (error.response?.status === 426) {
                errorMessage += "NewsAPI upgrade required.";
            } else if (error.response?.status === 429) {
                errorMessage += "Rate limit exceeded. Try again later.";
            } else if (error.response?.status === 401) {
                errorMessage += "API key issue.";
            } else {
                errorMessage += "Please try again later.";
            }

            await client.sendMessage(
                message.key.remoteJid,
                {
                    text: errorMessage + "\n\nAvailable categories: general, business, technology, entertainment, sports, health, science",
                },
                { quoted: message }
            );
        }
    },
};