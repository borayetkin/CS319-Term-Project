const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const advisorAuth = require("../middleware/advisorMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

const {
    createFair,
    getFairs,
    getFair,
    updateFairStatus,
    assignGuideToFair,
    deleteFair,
} = require("../controllers/FairController.js");

//get
router.get('/',adminAuth, getFairs);
router.get('/fair/:id',adminAuth,getFair);

//post
router.post("/create",createFair);
router.post('/:id/assign-guide', adminAuth, assignGuideToFair);

router.patch('/:id/status', adminAuth, updateFairStatus);

//delete
router.delete('/:id', adminAuth, deleteFair);

module.exports = router;