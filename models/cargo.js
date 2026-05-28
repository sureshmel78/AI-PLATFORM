const mongoose=require("mongoose");

module.exports=mongoose.model("Cargo",new mongoose.Schema({
name:String,
load:String,
discharge:String,
qty:Number
}));