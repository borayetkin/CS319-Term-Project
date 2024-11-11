const SchoolTour = require('../models/SchoolTour');

exports.createSchoolTour = async (req, res) => {
    try {
        // Create the school tour directly from form data
        const schoolTour = new SchoolTour({
            schoolName: req.body.schoolName,
            contactPerson: req.body.contactPerson,
            email: req.body.email,
            visitDate: new Date(req.body.visitDate),
            visitTime: req.body.visitTime,
            city: req.body.city,
            studentCount: req.body.studentCount,
            additionalNotes: req.body.additionalNotes,
            phoneNumber: req.body.phoneNumber
        });
        await schoolTour.save();

        res.status(201).json({ 
            message: 'School tour created successfully',
            schoolTour
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating school tour', 
            error: error.message 
        });
    }
}; 