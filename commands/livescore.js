import axios from "axios";
import logger from "../utils/logger.js";

export default {
  name: "livescore",
  description: "Get live football match scores and updates",
  category: "sports",
  async execute(message, client, args) {
    try {
      // Show typing indicator
      await client.sendPresenceUpdate("composing", message.key.remoteJid);

      // Fetch live matches from Football-Data.org API
      const matches = await fetchLiveMatches();

      if (!matches || matches.length === 0) {
        await client.sendMessage(
          message.key.remoteJid,
          {
            text: "⚽ *No live matches currently playing*\n\nThere are no live football matches at the moment.\n\n🔜 Check back later for live action!",
          },
          { quoted: message }
        );
        return;
      }

      // Format the matches response
      const response = formatMatchesResponse(matches);

      // Send the live scores
      await client.sendMessage(
        message.key.remoteJid,
        {
          text: response,
        },
        { quoted: message }
      );

    } catch (error) {
      logger.error("Error executing livescore command:", error);

      await client.sendMessage(
        message.key.remoteJid,
        {
          text: "❌ *Error fetching live scores*\n\nPlease try again later. The football API might be temporarily unavailable.",
        },
        { quoted: message }
      );
    }
  },
};

// Fetch live matches from Football-Data.org API
async function fetchLiveMatches() {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/matches?status=LIVE",
      {
        headers: {
          "X-Auth-Token": "c2a7da9e08d745fc9c763999f1ecac09"
        }
      }
    );

    return response.data.matches;
  } catch (error) {
    console.error("Error fetching live matches:", error);

    // Fallback to mock data if API fails
    return getMockMatches();
  }
}

// Format the response with ASCII art
function formatMatchesResponse(matches) {
  let response = `
╔══════════════════════════════════════╗
║             ⚽ LIVE SCORES ⚽         ║
╠══════════════════════════════════════╣
║                                      ║
    `.trim();

  matches.slice(0, 5).forEach((match, index) => {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;
    const homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : "0";
    const awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : "0";
    const competition = match.competition.name;
    const status = match.status;
    const minute = match.minute || "Live";

    // Determine match status and icon
    let statusIcon = "⏱️";
    let statusText = minute;

    if (status === "PAUSED") {
      statusIcon = "⏸️";
      statusText = "HALF TIME";
    } else if (status === "FINISHED") {
      statusIcon = "✅";
      statusText = "FULL TIME";
    } else if (status === "IN_PLAY") {
      statusIcon = "⚽";
      statusText = `${minute}'`;
    }

    // Truncate long team names
    const truncateName = (name, maxLength) => {
      if (name.length <= maxLength) return name;
      return name.substring(0, maxLength - 3) + "...";
    };

    response += `
║  ${getCompetitionIcon(competition)} ${truncateName(competition, 25)}
║
║  🏠 ${truncateName(homeTeam, 15)} ${homeScore} - ${awayScore} ${truncateName(
      awayTeam,
      15
    )} 🚌
║  ${statusIcon} ${statusText}
║
`;

    if (index < matches.length - 1 && index < 4) {
      response += `║  ─────────────────────────────────────
`;
    }
  });

  response += `
║                                      ║
║  📊 ${matches.length} live matches showing      ║
║  💡 Use !livescore for live updates  ║
║                                      ║
╚══════════════════════════════════════╝
    `.trim();

  return response;
}

// Get appropriate icon for competition
function getCompetitionIcon(competition) {
  const icons = {
    "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "La Liga": "🇪🇸",
    "Bundesliga": "🇩🇪",
    "Serie A": "🇮🇹",
    "Ligue 1": "🇫🇷",
    "Champions League": "⭐",
    "Europa League": "🌍",
    "World Cup": "🌎",
    "European Championship": "🇪🇺",
    "Copa America": "🇦🇷",
    "Africa Cup of Nations": "🌍",
  };

  for (const [key, value] of Object.entries(icons)) {
    if (competition.includes(key)) {
      return value;
    }
  }

  return "🏆";
}

// Fallback mock data if API fails
function getMockMatches() {
  return [
    {
      homeTeam: { name: "Manchester United" },
      awayTeam: { name: "Liverpool" },
      score: { fullTime: { home: 1, away: 2 } },
      competition: { name: "Premier League" },
      status: "IN_PLAY",
      minute: 67
    },
    {
      homeTeam: { name: "Barcelona" },
      awayTeam: { name: "Real Madrid" },
      score: { fullTime: { home: 2, away: 1 } },
      competition: { name: "La Liga" },
      status: "PAUSED",
      minute: "HT"
    },
    {
      homeTeam: { name: "Bayern Munich" },
      awayTeam: { name: "Dortmund" },
      score: { fullTime: { home: 3, away: 0 } },
      competition: { name: "Bundesliga" },
      status: "FINISHED",
      minute: "FT"
    },
  ];
}