const makeWASocket = require("@whiskeysockets/baileys").default;
const { BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType } = require("@whiskeysockets/baileys");
const util = require("util");
const { useMultiFileAuthState, jidDecode, makeInMemoryStore, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default;
const pino = require("pino");
const gp = ["254739168811"];
const fs = require("fs");
const figlet = require("figlet");
const chalk = require("chalk");
const os = require("os");
const speed = require("performance-now");
const timestampe = speed();
const dreadedspeed = speed() - timestampe;

const spinnies = new (require('spinnies'))();

const { Boom } = require("@hapi/boom");
const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

const makeWASocket = require("@whiskeysockets/baileys").default;
const { proto, jidDecode, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const chalk = require("chalk");
const figlet = require("figlet");

async function main() {
  console.log(
    chalk.green(
      figlet.textSync("4ORTY6YXbot", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
        whitespaceBreak: false,
      })
    )
  );

  const { state, saveCreds } = await useMultiFileAuthState('session');

  const sock = makeWASocket({
    logger: pino({
      level: 'silent'
    }),
    printQRInTerminal: true,
    browser: ['4ORTY6YXbot', 'safari', '1.0.0'],
    auth: state,
    qrTimeout: 20000000,
  });

  sock.ev.on('qr', saveCreds);

  sock.ev.on('messages.upsert', async chatUpdate => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;

    const sender = sock.decodeJid(m.key.remoteJid);
    const statusText = m.message.conversation || '';
    
    console.log(`Received a status update from ${sender}: ${statusText}`);
  });

  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  sock.ev.on('connection.update', async (update) => {
    const {
      connection,
      lastDisconnect,
      qr
    } = update;
    if (lastDisconnect == 'undefined' && qr != 'undefined') {
      qrcode.generate(qr, {
        small: true
      });
    }
    if (connection === 'connecting') {
      console.log('Connecting Now...');
    } else if (connection === 'open') {
      console.log(`Successfully Connected. You have logged in as ${sock.user.name}`);
    } else if (connection === 'close') {
      if (lastDisconnect.error?.output?.statusCode === 401) {
        console.log(`Can't connect!`);
        process.exit(0);
      } else {
        main().catch(() => main());
      }
    }
  });


}

main();
