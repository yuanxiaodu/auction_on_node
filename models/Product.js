/**
 * Created by Ashley on 15/2/15.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var Picture = require('../models/Picture');

var ProductSchema = new Schema({
    title: String,
    pictures: [{
        originalname: String,
        name: String
    }],
    startPrice: Number,
    markup: Number,
    start: Date,
    end: Date,
    catalog: String,
    description: String,
    status: Number,
    lastModify: Date,
    modifier: String,
    bidders: [{
        name: String,
        phone: String,
        price: Number,
        bidTime: Date
    }]
});

module.exports = mongodb.mongoose.model("Product", ProductSchema);