import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import semver from 'semver';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CONFIGURATION: Replace these with your GitHub details
const GITHUB_REPO = "Dexxtiny/SAINt-MD"; // e.g., "Saint-MD/saint-md-v3"

export default {
    name: "update",
    description: "Check for bot updates and new features",
    category: "utility",
    async execute(message, client, args) {
        try {
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // 1. Get current version from package.json
            let currentVersion = "0.0.0";
            try {
                const packagePath = join(__dirname, './package.json'); // Adjusted path for same dir
                const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                currentVersion = packageJson.version || "0.0.0";
            } catch (error) {
                console.error('Error reading package.json:', error);
            }
            
            // 2. Fetch releases from GitHub API
            let releaseInfo = {};
            try {
                const response = await axios.get(
                    `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
                    {
                        timeout: 10000,
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Saint-MD-Bot'
                        }
                    }
                );
                
                const latestRelease = response.data;
                releaseInfo.latestVersion = latestRelease.tag_name.replace(/^v/, '');
                releaseInfo.releaseName = latestRelease.name || latestRelease.tag_name;
                releaseInfo.releaseNotes = latestRelease.body || "No release notes available";
                releaseInfo.releaseDate = latestRelease.published_at;
                releaseInfo.upcomingRelease = latestRelease.prerelease || false;

            } catch (error) {
                console.error('GitHub API Error, attempting fallback to tags...');
                
                // Fallback: Fetch Tags if no "Official Release" is found
                try {
                    const tagResponse = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/tags`);
                    if (tagResponse.data && tagResponse.data.length > 0) {
                        const latestTag = tagResponse.data[0];
                        releaseInfo.latestVersion = latestTag.name.replace(/^v/, '');
                        releaseInfo.releaseName = `Tag: ${latestTag.name}`;
                        releaseInfo.releaseNotes = "Check GitHub commits for details.";
                    }
                } catch (fallbackError) {
                    throw new Error('All update paths failed.');
                }
            }
            
            // 3. Check if update is available
            let updateAvailable = false;
            let updateType = "none";
            
            if (semver.valid(releaseInfo.latestVersion) && semver.valid(currentVersion)) {
                if (semver.gt(releaseInfo.latestVersion, currentVersion)) {
                    updateAvailable = true;
                    updateType = semver.diff(currentVersion, releaseInfo.latestVersion);
                }
            }
            
            // 4. Get changelog (Commits since current version)
            const changelog = await getChangelog(currentVersion, releaseInfo.latestVersion);
            
            // 5. Send Formatted Message
            const updateMessage = formatUpdateMessage(
                currentVersion, 
                releaseInfo, 
                updateAvailable, 
                updateType,
                changelog
            );
            
            await client.sendMessage(message.key.remoteJid, { text: updateMessage }, { quoted: message });
            
        } catch (error) {
            console.error('Update command error:', error);
            await client.sendMessage(message.key.remoteJid, { text: '❌ System was unable to reach GitHub servers.' }, { quoted: message });
        }
    }
};

async function getChangelog(current, latest) {
    try {
        // GitHub compare API
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_REPO}/compare/v${current}...v${latest}`
        );
        if (response.data && response.data.commits) {
            return response.data.commits
                .slice(-5)
                .map(c => `• ${c.commit.message.split('\n')[0]}`)
                .join('\n');
        }
    } catch { return null; }
}

function formatUpdateMessage(current, release, available, type, changelog) {
    let msg = `✨ *SAINT MD SYSTEM UPDATE*\n\n`;
    msg += `📋 *Current:* v${current}\n`;
    msg += `🚀 *Latest:* v${release.latestVersion}\n\n`;

    if (available) {
        const emoji = type === 'major' ? '⚠️' : type === 'minor' ? '✨' : '🔧';
        msg += `${emoji} *${type.toUpperCase()} Update Available!*\n\n`;
        msg += `📝 *Notes:*\n${release.releaseNotes.substring(0, 300)}${release.releaseNotes.length > 300 ? '...' : ''}\n\n`;
        if (changelog) msg += `📄 *Recent Commits:*\n${changelog}\n\n`;
        msg += `💡 *How to update:* Restart your bot or redeploy to fetch latest changes.`;
    } else {
        msg += `✅ *You are running the latest version!*`;
    }

    msg += `\n\n🌐 *Repo:* https://github.com/${GITHUB_REPO}`;
    return msg;
}
