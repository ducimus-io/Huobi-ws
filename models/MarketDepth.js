const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create MarketDepth Schema
const MarketDepthSchema = new Schema({
    id: {
        type: String
    },
    time: {
        type: String
    },
    numA: {
        type: String
    },
    numB: {
        type: String
    },
    asks: {
        type: String,
    },
    bids: {
        type: String,
    }
});

module.exports = MarketDepth = mongoose.model('marketDepth', MarketDepthSchema);