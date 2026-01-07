const express = require("express")
const router = express.Router()
const signupController = require("../controllers/signupConttroler")
const userMiddleware = require("../middleware/userMiddleware")

router.get("/userlogin", signupController.getAllUser)
router.post("/register",signupController.createNewUser)
router.patch("/update/:id",signupController.updateUser)
router.delete("/delete/:id",signupController.deleteUser)
router.get("/getAuser",userMiddleware,signupController.getAuser)
router.post("/login", signupController.login)
router.post("/refreshToken",signupController.refreshToken)
module.exports = router