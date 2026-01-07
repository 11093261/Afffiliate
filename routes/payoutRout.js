const express = require("express")
const payoutController = require("../controllers/payoutController")
const userMiddleware = require("../middleware/userMiddleware")
const payoutRoute = express.Router()
payoutRoute.get("/getapayout",userMiddleware,payoutController.getApayout)
payoutRoute.post("/postApayout",userMiddleware,payoutController.createApayout)
payoutRoute.patch("/updatepayout:id/",userMiddleware,payoutController.updatepayout)

module.exports = payoutRoute
