const mongoose = require("mongoose");

const DealSchema = new mongoose.Schema({
vessel:String,
cargo:String,
score:Number,
created:Date
});

module.exports = mongoose.model("Deal",DealSchema);