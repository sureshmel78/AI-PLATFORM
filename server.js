require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const Vessel = require("./models/Vessel");
const Cargo = require("./models/Cargo");
const Deal = require("./models/Deal");

const { runMatching } = require("./services/aiEngine");

const app = express();

app.use(express.json());
app.use(express.static("frontend"));

mongoose.connect(process.env.MONGO_URL);

app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"frontend/index.html"));
});

/* Add Vessel */
app.post("/vessels", async (req,res)=>{

await Vessel.create(req.body);
await runMatching();

res.send("vessel added");

});

/* Add Cargo */
app.post("/cargo", async (req,res)=>{

await Cargo.create(req.body);
await runMatching();

res.send("cargo added");

});

/* Get Deals */
app.get("/deals", async (req,res)=>{

const deals = await Deal.find().sort({score:-1});
res.json(deals);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
console.log("AI Shipping Platform Running");
});