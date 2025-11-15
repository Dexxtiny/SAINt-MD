// mega.js
const mega = require('megajs');
const fs = require('fs');
const path = require('path');

class MegaSessionManager {
    constructor() {
        this.megaId = process.env.MEGA_ID; // The specific ID to find in MEGA storage
        this.sessionDir = './sessions';
    }

    async initialize() {
        try {
            // Check if MEGA_ID is set
            if (!this.megaId) {
                throw new Error('MEGA_ID environment variable is not set');
            }

            console.log(`Looking for MEGA ID: ${this.megaId}`);

            // Ensure session directory exists
            this.ensureSessionDirectory();

            // Connect to MEGA storage (you'll need master credentials)
            const storage = await this.connectToMega();

            // Find the folder with our MEGA_ID
            const idFolder = await this.findFolder(storage, this.megaId);
            
            // Find creds.json in that folder
            const credsFile = await this.findFile(idFolder, 'creds.json');
            
            // Download creds.json to session directory
            await this.downloadFile(credsFile, path.join(this.sessionDir, 'creds.json'));

            console.log('✓ Creds file successfully downloaded from MEGA storage');
            console.log(`✓ Saved to: ${path.join(this.sessionDir, 'creds.json')}`);

            return {
                success: true,
                megaId: this.megaId,
                destination: path.join(this.sessionDir, 'creds.json')
            };

        } catch (error) {
            console.error('✗ Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async connectToMega() {
        return new Promise((resolve, reject) => {
            // You need to set these master credentials in environment variables
            const email = process.env.MEGA_MASTER_EMAIL;
            const password = process.env.MEGA_MASTER_PASSWORD;

            if (!email || !password) {
                reject(new Error('MEGA_MASTER_EMAIL and MEGA_MASTER_PASSWORD environment variables are required'));
                return;
            }

            console.log('Connecting to MEGA storage...');

            const storage = mega({
                email: email,
                password: password,
                autologin: true
            });

            storage.on('ready', () => {
                console.log('✓ Connected to MEGA storage successfully');
                resolve(storage);
            });

            storage.on('error', (error) => {
                reject(new Error(`MEGA connection failed: ${error.message}`));
            });

            setTimeout(() => {
                reject(new Error('MEGA connection timeout'));
            }, 15000);
        });
    }

    async findFolder(storage, folderName) {
        // Look for the folder with our MEGA_ID
        for (const file of storage.files) {
            if (file.directory && file.name === folderName) {
                console.log(`✓ Found folder: ${folderName}`);
                return file;
            }
        }
        throw new Error(`Folder not found in MEGA storage: ${folderName}`);
    }

    async findFile(folder, fileName) {
        // Get files in the folder
        const files = await folder.getChildren();
        
        for (const file of files) {
            if (!file.directory && file.name === fileName) {
                console.log(`✓ Found file: ${fileName}`);
                return file;
            }
        }
        throw new Error(`File not found in folder: ${fileName}`);
    }

    async downloadFile(file, destinationPath) {
        return new Promise((resolve, reject) => {
            const stream = file.download();
            const writeStream = fs.createWriteStream(destinationPath);

            stream.pipe(writeStream);

            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.on('error', (error) => {
                reject(new Error(`Download failed: ${error.message}`));
            });

            stream.on('error', (error) => {
                reject(new Error(`Download stream error: ${error.message}`));
            });
        });
    }

    ensureSessionDirectory() {
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
            console.log(`Created directory: ${this.sessionDir}`);
        }
    }
}

// If this script is run directly
if (require.main === module) {
    const megaManager = new MegaSessionManager();
    megaManager.initialize().then(result => {
        if (!result.success) {
            process.exit(1);
        }
    });
}

module.exports = MegaSessionManager;