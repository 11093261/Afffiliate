const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const upload = require("../config/cloudinary");
const authMiddleware = require('../middleware/userMiddleware');

// Public routes
router.get("/Allprogram", programController.getAllMerchantProgram);

// Protected routes (add auth as needed)
router.post("/postprogram", 
  // authMiddleware, // Add if needed
  programController.createMerchant
);

router.post("/promodata",
  authMiddleware,
  upload.single("promotionalMaterials"),
  programController.createpromotionalData
);

router.put("/updateprogram/:id", 
  authMiddleware,
  upload.single('promotionalMaterials'),
  programController.updateProgrames
);

router.delete("/deleteprogram/:id", 
  authMiddleware,
  programController.deleteProgram
);

// Additional useful routes (optional)
router.get("/program/:id", programController.getProgramById);
router.get("/categories", programController.getCategories);

module.exports = router;