const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const upload = require("../config/cloudinary") 
const authMiddleware = require('../middleware/userMiddleware');
router.get("/Allprogram", programController.getAllMerchantProgram);
router.post("/postprogram", 
  programController.createMerchant
);
router.post("/promodata",authMiddleware,upload.single("promotionalMaterials"),
programController.createpromotionalData)

router.put("/updateprogram/:id", 
  authMiddleware,
  upload.single('promotionalMaterials'),
  programController.updateProgrames
);
router.delete("/deleteprogram/:id", 
  authMiddleware,
  programController.deleteProgram
);



module.exports = router;