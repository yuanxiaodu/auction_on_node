/**
 * Created by Ashley on 15/2/15.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/auction');
exports.mongoose = mongoose;