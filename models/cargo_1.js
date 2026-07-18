const mongoose=require("mongoose");

module.exports=mongoose.model("cargo",new mongoose.Schema({
name:String,
load:String,
discharge:String,
qty:Number
}));