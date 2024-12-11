const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const {
    createFair,
    getFairs,
    getAcceptedFairs,
    getFair,
    updateFairStatus,
    assignGuideToFair,
    removeGuideFromFair,
    deleteFair,
    applyToFair,
} = require("../controllers/FairController.js");

//get
router.get('/',adminAuth, getFairs);
router.get('/fair/:id',auth,getFair);
router.get('/accepted-fairs',getAcceptedFairs);

//post
router.post("/create",createFair);

//post for admin
router.post('/:id/assign-guide', adminAuth, assignGuideToFair);
router.post('/:id/remove-guide', auth, removeGuideFromFair);

//post for guide
router.post("/apply", auth, applyToFair);

router.patch('/:id/status', adminAuth, updateFairStatus);

//delete
router.delete('/:id', adminAuth, deleteFair);

module.exports = router;