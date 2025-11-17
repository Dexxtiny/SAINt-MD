// mega.js (FIXED - Uses the correct Storage API)
import { Storage } from 'megajs'; // Import Storage directly
import fs from 'fs';
import path from 'path';

class MegaSessionManager {
    constructor() {
        this.sessionId = process.env.SESSION_ID;
        this.masterEmail = process.env.MEGA_MASTER_EMAIL;
        this.masterPassword = process.env.MEGA_MASTER_PASSWORD;
        this.sessionDir = './sessions';
        this.storage = null; // Will hold the storage instance
    }

    async initialize() {
        try {
            // ... (Your existing checks for SESSION_ID and credentials) ...
            console.log(`🔍 Looking for files containing: ${this.sessionId}`);

            // Ensure session directory exists
            this.ensureSessionDirectory();

            // Connect to MEGA storage
            this.storage = await new Storage({
                email: this.masterEmail,
                password: this.masterPassword
            }).ready;
            console.log('✅ Connected to MEGA storage successfully');

            // Search for the matching file
            const matchingFile = await this.findFileBySessionId(this.sessionId);
            
            if (!matchingFile) {
                console.log(`ℹ️  No files found containing session ID: ${this.sessionId}`);
                return { success: true, skipped: true };
            }

            // Download and rename the file
            await this.downloadAndRenameFile(matchingFile, path.join(this.sessionDir, 'creds.json'));
            console.log('✅ Creds file successfully downloaded from MEGA storage');

            return {
                success: true,
                sessionId: this.sessionId,
                originalFileName: matchingFile.name,
                destination: path.join(this.sessionDir, 'creds.json')
            };

        } catch (error) {
            console.error('❌ Mega Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        } finally {
            // Always close the storage connection when done
            if (this.storage) {
                this.storage.close();
            }
        }
    }

    async findFileBySessionId(sessionId) {
        // The 'files' property contains all files in the account[citation:1]
        for (const file of this.storage.files) {
            // Check if it's a file (not a folder) and if the name matches
            if (file.directory === false && file.name.includes(sessionId)) {
                console.log(`✅ Found matching file: ${file.name}`);
                return file;
            }
        }
        console.log(`ℹ️  No matching files found for: ${sessionId}`);
        return null;
    }

    async downloadAndRenameFile(file, destinationPath) {
        return new Promise((resolve, reject) => {
            console.log(`📥 Downloading: ${file.name} → creds.json`);

            const stream = file.download();
            const writeStream = fs.createWriteStream(destinationPath);

            stream.pipe(writeStream);

            writeStream.on('finish', () => {
                console.log(`✅ File saved as: creds.json`);
                resolve();
            });

            writeStream.on('error', (error) => {
                reject(new Error(`Write stream failed: ${error.message}`));
            });

            stream.on('error', (error) => {
                reject(new Error(`Download stream error: ${error.message}`));
            });
        });
    }

    ensureSessionDirectory() {
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
            console.log(`📁 Created directory: ${this.sessionDir}`);
        }
    }
}

export default MegaSessionManager;