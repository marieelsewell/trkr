const express = require('express');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// CREATE
router.post('/', authMiddleware, async (req, res) => {
    const { company, jobTitle, dateApplied, status, link } = req.body;
    const userId = req.session.user;
    try {
        const newApplication = new Application({ company, jobTitle, dateApplied, status, link, userId });
        await newApplication.save();
        res.status(201).json({ success: true, message: 'Application created successfully', application: newApplication });
    } catch (error) {
        // if error is a validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(422).json({ success: false, message: messages });
        } else {
            // if error is not a validation error
            return res.status(500).json({ success: false, message: 'Error creating application', error });
        }
    }
});

// READ
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.session.user;
    try {
        const applications = await Application.find({ userId });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving applications', error });
    }
});

// UPDATE
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { company, jobTitle, dateApplied, status, link } = req.body;
    const userId = req.session.user;
    try {
        const application = await Application.findOneAndUpdate({ _id: id, userId }, { company, jobTitle, dateApplied, status, link }, { new: true });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, message: 'Application updated successfully', application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating application', error });
    }
});

// DELETE
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user;
    try {
        const application = await Application.findOneAndDelete({ _id: id, userId });
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting application', error });
    }
});

module.exports = router;