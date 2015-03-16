/**
 * Created by Ashley on 15/2/15.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var PictureSchema = new Schema({
    name: String,
    originalname: String,
    description: String,
    lastModify: Date
});
module.exports = mongodb.mongoose.model("Picture", PictureSchema);