// Authorized phone numbers that can use bot commands
// Add numbers in international format without + (e.g., 15551234567)
export default {
  authorizedNumbers: [
    "2347088246238", // Example number - replace with your actual number
  ],

  // Bot settings
  bot: {
    name: "Savy DNI",
    prefix: "!",
    adminPrefix: "#",
    maxCommandHistory: 100,
  },

  // Feature toggles
  features: {
    crypto: true,
    betting: true,
    wallpaper: true,
    livescore: true,
    quote: true,
    shorten: true,
    translate: true,
  },

  // API settings
  api: {
    coingecko: {
      baseURL: "https://api.coingecko.com/api/v3",
      timeout: 10000,
    },
    livescore: {
      baseURL: "https://live-football-api.com",
      apiKey: "LFA-CE1876-6BE3E5-F21926",
      timeout: 8000,
    },
  },
};
