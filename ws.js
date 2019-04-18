const WebSocket = require('ws');
const moment = require('moment');
const pako = require('pako');
const chalk = require('chalk');

const log = console.log;

// Ws URL
const WS_URL = 'wss://api.huobi.pro/hbus/ws';

/**
 * Subscribe to symbols
 */
function subscribe(ws) {
    var symbols = ['ethbtc', 'btcusdt'];
    
    for (let symbol of symbols) {
        ws.send(JSON.stringify({
            "sub": `market.${symbol}.depth.step0`,
            "id": `${symbol}`
        }));
    }
}

/**
 * Initialize Websocket Connection
 */
function init() {
    // Init websocket
    var ws = new WebSocket(WS_URL);

    // onOpen event - subscribe to symbols
    ws.on('open', () => {
        log('open');
        subscribe(ws);
    });

    // Handle data
    ws.on('message', (data) => {

        // Unzip data 
        let text = pako.inflate(data, {
            to: 'string'
        });

        let msg = JSON.parse(text);

        if (msg.ping) {
            ws.send(JSON.stringify({
                pong: msg.ping
            }));
        } else if (msg.tick) {
            log(chalk.cyan("Id: ") + msg.ch);
            log(chalk.cyan("Timestamp: ") + msg.ts);
            log(chalk.cyan("Bids: ") + msg.tick.bids)
            log(chalk.cyan("Asks: ") + msg.tick.asks); // log data (bids & asks)
        } else {
            log(text);
        }
    });

    // onClose event
    ws.on('close', () => {
        log(chalk.red('Websocket closed! Trying to reconnect...'));
        init(); // start connection again
    });

    // onError event
    ws.on('error', err => {
        log(chalk.red('Websocket error: ', err));
        init(); // start connection again
    });
}

// Start websocket connection
init();