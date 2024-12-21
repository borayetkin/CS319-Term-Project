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
    unapplyFromFair, // Import the new controller method
    getUserFairs,
    markFairAsCompleted,
    takeBackFairAction,
    markFairAsCanceled
} = require("../controllers/FairController.js");

//get
router.get('/',adminAuth, getFairs);
router.get('/fair/:id',auth,getFair);
router.get('/accepted-fairs',getAcceptedFairs);
router.get('/user', auth, getUserFairs);

//post
router.post("/create",createFair);

//post for admin
router.post('/:id/assign-guide', adminAuth, assignGuideToFair);
router.post('/:id/remove-guide', auth, removeGuideFromFair);

//post for guide
router.post("/apply", auth, applyToFair);
router.post("/unapply", auth, unapplyFromFair); // Add the new route

router.patch('/:id/status', adminAuth, updateFairStatus);

//delete
router.delete('/:id', adminAuth, deleteFair);

// Add these routes with your other fair routes
router.post('/:fairId/complete', auth, markFairAsCompleted);
router.post('/:fairId/take-back', auth, takeBackFairAction);
router.post('/:fairId/mark-cancelled', auth, markFairAsCanceled);
module.exports = router;