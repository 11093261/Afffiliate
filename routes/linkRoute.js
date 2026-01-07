const express = require("express")
const linkController = require("../controllers/linkController")
const middleware = require('../middleware/userMiddleware')
const linkRoute = express.Router()
linkRoute.get("/getAllLink/:id",middleware,linkController.getAllLink)
linkRoute.post("/newlink", middleware,linkController.createNewLinks)

module.exports = linkRoute