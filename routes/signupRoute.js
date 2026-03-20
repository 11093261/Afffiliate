const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupConttroler");
const userMiddleware = require("../middleware/userMiddleware");
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// ✅ NO middleware for register and login
router.post("/register", signupController.createNewUser);
router.post("/login", signupController.login);
router.post("/refreshToken", signupController.refreshToken);

// ✅ Protected routes (with middleware)
router.get("/userlogin", userMiddleware, signupController.getAllUser);
router.patch("/update/:id", userMiddleware, signupController.updateUser);
router.delete("/delete/:id", userMiddleware, signupController.deleteUser);
router.get("/getAuser", userMiddleware, signupController.getAuser);

module.exports = router;