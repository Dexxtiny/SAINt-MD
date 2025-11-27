import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import semver from 'semver';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    name: "update",
    description: "Check for bot updates and new features",
    category: "utility",
    async execute(message, client, args) {
        try {
            // Show typing indicator
            await client.sendPresenceUpdate('composing', message.key.remoteJid);
            
            // Get current version from package.json
            let currentVersion = "unknown";
            try {
                const packagePath = join(__dirname, '../package.json');
                const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                currentVersion = packageJson.version || "unknown";
            } catch (error) {
                console.error('Error reading package.json:', error);
            }
            
            // Fetch releases from GitLab API
            let releaseInfo = {};
            try {
                const response = await axios.get(
                    'https://gitlab.com/api/v4/projects/75665783/releases',
                    {
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'savy.DNI.x'
                        }
                    }
                );
                
                if (response.data && response.data.length > 0) {
                    // Get the latest release
                    const latestRelease = response.data[0];
                    releaseInfo.latestVersion = latestRelease.tag_name.replace(/^v/, '');
                    releaseInfo.releaseName = latestRelease.name || latestRelease.tag_name;
                    releaseInfo.releaseNotes = latestRelease.description || "No release notes available";
                    releaseInfo.releaseDate = latestRelease.released_at;
                    releaseInfo.upcomingRelease = latestRelease.upcoming_release || false;
                    
                } else {
                    // Fallback to using the latest commit
                    const commitResponse = await axios.get(
                        'https://gitlab.com/api/v4/projects/75665783/repository/commits/main',
                        { timeout: 8000 }
                    );
                    releaseInfo.latestVersion = "unknown";
                    releaseInfo.releaseName = "Development Build";
                    releaseInfo.releaseNotes = commitResponse.data.title || "No recent updates";
                    releaseInfo.releaseDate = commitResponse.data.committed_date;
                }
            } catch (error) {
                console.error('Error fetching GitLab releases:', error);
                
                // Fallback to tags if releases fail
                try {
                    const tagResponse = await axios.get(
                        'https://gitlab.com/api/v4/projects/75665783/repository/tags',
                        { timeout: 8000 }
                    );
                    
                    if (tagResponse.data && tagResponse.data.length > 0) {
                        const latestTag = tagResponse.data[0];
                        releaseInfo.latestVersion = latestTag.name.replace(/^v/, '');
                        releaseInfo.releaseName = `Tag: ${latestTag.name}`;
                        releaseInfo.releaseNotes = latestTag.commit?.message || "No release notes";
                        releaseInfo.releaseDate = latestTag.commit?.committed_date;
                    } else {
                        throw new Error('No tags found');
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    releaseInfo.latestVersion = "unknown";
                    releaseInfo.releaseName = "Unknown";
                    releaseInfo.releaseNotes = "Unable to fetch update information";
                }
            }
            
            // Check if update is available
            let updateAvailable = false;
            let updateType = "none";
            let changelog = "";
            
            if (currentVersion !== "unknown" && releaseInfo.latestVersion !== "unknown") {
                if (semver.gt(releaseInfo.latestVersion, currentVersion)) {
                    updateAvailable = true;
                    
                    // Determine update type
                    const currentMajor = semver.major(currentVersion);
                    const latestMajor = semver.major(releaseInfo.latestVersion);
                    
                    if (latestMajor > currentMajor) {
                        updateType = "major";
                    } else if (semver.minor(releaseInfo.latestVersion) > semver.minor(currentVersion)) {
                        updateType = "minor";
                    } else {
                        updateType = "patch";
                    }
                }
                
                // Get changelog if available
                changelog = await getChangelog(currentVersion, releaseInfo.latestVersion);
            }
            
            // Format the response
            const updateMessage = formatUpdateMessage(
                currentVersion, 
                releaseInfo, 
                updateAvailable, 
                updateType,
                changelog
            );
            
            // Send the update information
            await client.sendMessage(
                message.key.remoteJid,
                { text: updateMessage },
                { quoted: message }
            );
            
        } catch (error) {
            console.error('Error checking for updates:', error);
            
            await client.sendMessage(
                message.key.remoteJid,
                { 
                    text: '❌ Could not check for updates. Please try again later.' 
                },
                { quoted: message }
            );
        }
    }
};

// Get changelog between versions
async function getChangelog(currentVersion, latestVersion) {
    try {
        // Try to get commits between versions for changelog
        const response = await axios.get(
            `https://gitlab.com/api/v4/projects/75665783/repository/compare?from=v${currentVersion}&to=v${latestVersion}`,
            { timeout: 8000 }
        );
        
        if (response.data && response.data.commits) {
            const commits = response.data.commits.slice(0, 5); // Last 5 commits
            return commits.map(commit => 
                `• ${commit.title}`
            ).join('\n');
        }
    } catch (error) {
        console.log('Could not fetch changelog:', error.message);
    }
    return null;
}

// Format the update message
function formatUpdateMessage(currentVersion, releaseInfo, updateAvailable, updateType, changelog) {
    let message = `🔄 *savy.DNI.x Update Information*\n\n`;
    
    message += `📋 *Current Version:* v${currentVersion}\n`;
    message += `🚀 *Latest Release:* ${releaseInfo.releaseName}\n`;
    message += `🔖 *Version:* v${releaseInfo.latestVersion}\n`;
    
    if (releaseInfo.releaseDate) {
        const releaseDate = new Date(releaseInfo.releaseDate).toLocaleDateString();
        message += `📅 *Released:* ${releaseDate}\n`;
    }
    
    message += `\n`;
    
    if (updateAvailable) {
        // Add appropriate emoji based on update type
        let updateEmoji = "🔧";
        let updateText = "Patch Update";
        
        if (updateType === "major") {
            updateEmoji = "⚠️";
            updateText = "Major Update";
        } else if (updateType === "minor") {
            updateEmoji = "✨";
            updateText = "Feature Update";
        }
        
        message += `${updateEmoji} *${updateText} Available!*\n\n`;
        
        // Show release notes
        if (releaseInfo.releaseNotes && releaseInfo.releaseNotes !== "No release notes available") {
            message += `📝 *Release Notes:*\n`;
            // Truncate if too long
            const notes = releaseInfo.releaseNotes.length > 500 
                ? releaseInfo.releaseNotes.substring(0, 500) + '...' 
                : releaseInfo.releaseNotes;
            message += `${notes}\n\n`;
        }
        
        // Show changelog if available
        if (changelog) {
            message += `📄 *Recent Changes:*\n${changelog}\n\n`;
        }
        
        message += `💡 *Update Instructions:*\n`;
        message += `The system will automatically fetch the latest version during deployment.\n\n`;
        
        if (releaseInfo.upcomingRelease) {
            message += `🎯 *Note:* This is an upcoming release preview.\n`;
        }
        
        if (updateType === "major") {
            message += `\n⚠️ *Important:* Major updates may contain breaking changes.\n`;
        }
        
    } else {
        message += `✅ *Status:* You're running the latest version!\n\n`;
        
        // Show what's in this release
        if (releaseInfo.releaseNotes && releaseInfo.releaseNotes !== "No release notes available") {
            message += `📝 *This Release Includes:*\n`;
            const notes = releaseInfo.releaseNotes.length > 400 
                ? releaseInfo.releaseNotes.substring(0, 400) + '...' 
                : releaseInfo.releaseNotes;
            message += `${notes}\n\n`;
        }
        
        message += `🔄 Updates are automatically managed through the deployment system.\n`;
        
        if (releaseInfo.upcomingRelease) {
            message += `\n🔮 *Upcoming Release Preview* - Features may change.`;
        }
    }
    
    message += `\n📖 *Repository:* https://gitlab.com/savy-dni-x/savy.dni.x`;
    
    return message;
}

// Additional function to check for pre-releases
async function checkPreReleases() {
    try {
        const response = await axios.get(
            'https://gitlab.com/api/v4/projects/75665783/releases?per_page=10'
        );
        
        const preReleases = response.data.filter(release => 
            release.tag_name.includes('-alpha') || 
            release.tag_name.includes('-beta') ||
            release.tag_name.includes('-rc')
        );
        
        return preReleases.slice(0, 3); // Return latest 3 pre-releases
    } catch (error) {
        return [];
    }
}