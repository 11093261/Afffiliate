const express = require("express")
const path = require("path")
const cors = require("cors")
require("dotenv").config({ path: path.resolve(__dirname, '.env') })
const userRoute = require("./routes/userRoute")
const merchantRoute = require("./routes/merchantRoute")
const affiliateRoute = require("./routes/affiliateRoute")
const signupRoute = require("./routes/signupRoute")
const productRoute = require("./routes/programRoute")
const payoutRoute = require("./routes/payoutRout")
const performanceRoute = require("./routes/performanceRoute")
const rootRoute = require("./routes/rootRoute")
const linkRoute = require("./routes/linkRoute")
const dbconnect = require("./config/dbconnect")
const mongoose = require("mongoose")
const morgan = require("morgan")
const PORT = process.env.PORT || 4500
console.log('PORT:', process.env.PORT)
const app = express()
dbconnect()
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))
app.use("html",(req,res)=>{
    res.status(401)
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname,"views","404.html"))
    }
    if(req.accepts("json")){
        res.status(404).json({message:"404 Not Found"})
    }else{
        res.send("txt").json({message:"404 not Found"})
    }
})
app.use("/api", userRoute)
app.use("/api", merchantRoute)
app.use("/api", affiliateRoute)
app.use("/api",signupRoute)
app.use("/api",productRoute)
app.use("/api",payoutRoute)
app.use("/api",performanceRoute)
app.use("/api",linkRoute)
mongoose.connection.once("open", () => {
    console.log("MongoDB connection established")
    app.listen(PORT, () => console.log(`Server running on Port ${PORT}`))
})
mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err)
    process.exit(1)
})
