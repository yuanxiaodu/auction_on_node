/**
 * Created by Ashley on 15/2/15.
 */
var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var UserSchema = new Schema({
    username : String,
    password : String,
    email : String,
    phone : String
});
module.exports = mongodb.mongoose.model("User", UserSchema);