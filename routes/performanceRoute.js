const performanceController = require("../controllers/PerformanceController")
const express = require("express")
const performanceRoute = express.Router()
const middleware = require("../middleware/userMiddleware")
performanceRoute.get("/performance",performanceController.getAllperformance)
performanceRoute.patch("/updateperformance/:id",middleware, performanceController.updateperfornmance)
performanceRoute.get("/getAperformance/:id",middleware,performanceController.getAperformance)
module.exports = performanceRoute


 