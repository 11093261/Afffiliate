const express = require("express")
const router = express.Router()
const affiliateController = require("../controllers/affilliateController")
router.get("/affiliatelink",affiliateController.getTracking)
router.post("/affilinkconversion",affiliateController.conversions)

module.exports = router