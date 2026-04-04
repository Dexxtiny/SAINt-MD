import makeWASocket, { 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    useMultiFileAuthState, 
    jidDecode,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import NodeCache from 'node-cache';
import { fileURLToPath } from 'url';
import path from 'path';

import CommandHandler from './command.js';
import messageHandler from './message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create lightweight store like he does
const store = {
    contacts: {},
    loadMessage: async (jid, id) => {
        return null;
    },
    bind: (ev) => {
        // Minimal store binding
    }
};

async function startSaint() {
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState(`./sessions`);
        const msgRetryCounterCache = new NodeCache();
        
        const handler = new CommandHandler();
        await handler.loadCommands();

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: 60000,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 10000,
        });

        // Save credentials when they update
        sock.ev.on('creds.update', saveCreds);

        // Bind store
        store.bind(sock.ev);

        // Add decodeJid helper like he does
        sock.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        // Contacts update handler
        sock.ev.on('contacts.update', update => {
            for (let contact of update) {
                let id = sock.decodeJid(contact.id);
                if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
            }
        });

        // getName function like he does
        sock.getName = (jid, withoutContact = false) => {
            let id = sock.decodeJid(jid);
            withoutContact = sock.withoutContact || withoutContact;
            let v;
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = await sock.groupMetadata(id).catch(() => ({})) || {};
                resolve(v.name || v.subject || id.replace('@s.whatsapp.net', ''));
            });
            else v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === sock.decodeJid(sock.user.id) ?
                sock.user :
                (store.contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || id.replace('@s.whatsapp.net', '');
        };

        sock.public = true;

        // Connection handling - KEEPING YOUR CONNECTION MESSAGE
        sock.ev.on('connection.update', async (s) => {
            const { connection, lastDisconnect, qr } = s;
            
            if (qr) {
                console.log('📱 QR Code generated. Please scan with WhatsApp.');
            }
            
            if (connection === 'connecting') {
                console.log('🔄 Connecting to WhatsApp...');
            }
            
            if (connection === "open") {
                console.log('✅ Bot Connected Successfully!');
                console.log('📱 Bot Number:', sock.user.id);

                // YOUR CONNECTION MESSAGE - KEPT EXACTLY AS YOU HAD
                try {
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    await sock.sendMessage(botNumber, {
                        text: `🤖 Bot Connected Successfully!\n\n⏰ Time: ${new Date().toLocaleString()}\n✅ Status: Online and Ready!\n\n🔗 Join our WhatsApp channel:\nhttps://whatsapp.com/channel/0029VbCoGmm8kyyJg9kcBV3m`
                    });
                } catch (error) {
                    console.error('Error sending connection message:', error.message);
                }
            }
            
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                
                console.log(`Connection closed due to ${lastDisconnect?.error}, reconnecting ${shouldReconnect}`);
                
                if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                    try {
                        fs.rmSync('./sessions', { recursive: true, force: true });
                        console.log('Session folder deleted. Please re-authenticate.');
                    } catch (error) {
                        console.error('Error deleting session:', error);
                    }
                    console.log('Session logged out. Please re-authenticate.');
                }
                
                if (shouldReconnect) {
                    console.log('Reconnecting...');
                    await delay(5000);
                    startSaint();
                }
            }
        });

        // Anticall handler like he does
        const antiCallNotified = new Set();
        sock.ev.on('call', async (calls) => {
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await sock.sendMessage(callerJid, { text: '📵 Calls are not allowed. You will be blocked.' });
                    }
                    setTimeout(async () => {
                        try { await sock.updateBlockStatus(callerJid, 'block'); } catch {}
                    }, 800);
                } catch {}
            }
        });

        // Group participants update
        sock.ev.on('group-participants.update', async (update) => {
            console.log('👥 Group participants update:', update);
        });

        // MESSAGE HANDLER - Copying his EXACT pattern but sending to YOUR message.js
        sock.ev.on('messages.upsert', async chatUpdate => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.message) return;
                
                // Unwrap ephemeral messages EXACTLY like he does
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;
                
                // Skip status broadcasts
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    return;
                }
                
                // Clear message retry cache to prevent memory bloat (like he does)
                if (sock?.msgRetryCounterCache) {
                    sock.msgRetryCounterCache.clear();
                }
                
                // Pass to YOUR messageHandler (instead of his handleMessages)
                // Passing sock, chatUpdate, and handler
                await messageHandler(sock, chatUpdate, handler);
                
            } catch (err) {
                console.error("Error in messages.upsert:", err);
            }
        });

        return sock;
        
    } catch (error) {
        console.error('Error in startSaint:', error);
        await delay(5000);
        startSaint();
    }
}

export default startSaint;
