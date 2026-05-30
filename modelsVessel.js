const mongoose = require("mongoose");

const VesselSchema = new mongoose.Schema({
name:String,
dwt:Number,
location:String,
openDate:String
});

module.exports = mongoose.model("Vessel",VesselSchema);