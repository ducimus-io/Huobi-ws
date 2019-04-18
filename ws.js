const WebSocket = require('ws');
const pako = require('pako');
const chalk = require('chalk');
const mongoose = require('mongoose');

const log = console.log;

// Ws URL
const WS_URL = 'wss://api.huobi.pro/hbus/ws';

// DB Config
const db = require('./config/keys').mongoURI;

// Bring in MarketDepth model
const MarketDepth = require('./models/MarketDepth');

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => log('MongoDB Connected'))
    .catch(err => log(err));

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

            // Create new mongoose model
            const newMarketDepth = new MarketDepth({
                id: msg.ch,
                time:  msg.ts,
                numA: msg.tick.asks.length,
                numB: msg.tick.bids.length
                //asks: msg.tick.asks,
                //bids: msg.tick.bids
            });

            // Save model to mongoDB
            newMarketDepth.save().then(marketDepth => marketDepth);

            log(chalk.yellow("Id: ") + chalk.magenta(msg.ch));
            log(chalk.yellow("Timestamp: ") + chalk.magenta(msg.ts));
            log(chalk.yellow("Bids Num: ") + chalk.magenta(msg.tick.bids.length));
            //log(chalk.yellow("Bids: ") + msg.tick.bids);
            log(chalk.yellow("Asks Num: ") + chalk.magenta(msg.tick.asks.length));
            //log(chalk.yellow("Asks: ") + msg.tick.asks);
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