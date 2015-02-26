/**
 * Created by Ashley on 15/2/15.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var ProductSchema = new Schema({
    description: String,
    catalog: String,
    pictures: [String],
    startPrice: Number,
    markup: Number,
    start: Date,
    end: Date,
    status: Number,
    bidders: [{
        name: String,
        phone: String,
        price: Number,
        bidTime: Date
    }],
    lastModify: Date,
    modifier: String
});
module.exports = mongodb.mongoose.model("Product", ProductSchema);