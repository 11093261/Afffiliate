const express = require("express")
const router = express.Router()
const merchantController = require("../controllers/merchantController")
router.get("/Allprograms",merchantController.getAllmerchants)
router.get("/programs/:id",merchantController.getAmerchant)
router.post("/merchant",merchantController.createMerchants)
router.patch("/updatemerchant/:id",merchantController.updateMerchants)
router.delete("/deletemerchant/:id",merchantController.deleteMerchants)

module.exports = router