const mongoose=require("mongoose");

module.exports=mongoose.model("Vessel",new mongoose.Schema({
name:String,
size:Number,
open:String,
speed:Number,
fuel:Number,
class:String
}));