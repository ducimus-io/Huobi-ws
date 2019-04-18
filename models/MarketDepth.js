const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create MarketDepth Schema
const MarketDepthSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    numA: {
        type: String,
        required: true
    },
    numB: {
        type: String,
        required: true
    },
    asks: {
        type: [],
    },
    bids: {
        type: [],
    }
});

module.exports = MarketDepth = mongoose.model('marketDepth', MarketDepthSchema);