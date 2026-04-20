const mongoose = require("mongoose");

const CargoSchema = new mongoose.Schema({
commodity:String,
loadPort:String,
qty:Number
});

module.exports = mongoose.model("Cargo",CargoSchema);