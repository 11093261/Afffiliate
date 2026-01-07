const express = require("express")
const root = express.Router()
const path = require("path")
const rootRoute = root.get("/",async(req,res)=>{
    res.sendFile(path.join(__dirname,"views","index.html"))
})
module.exports = rootRoute