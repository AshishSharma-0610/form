const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Response = require('../models/Response');

// Create a new form
router.post('/', async (req, res) => {
    try {
        const newForm = new Form(req.body);
        const savedForm = await newForm.save();
        res.json(savedForm);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all forms
router.get('/', async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a specific form
router.get('/:id', async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ message: 'Form not found' });
        res.json(form);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit a form response
router.post('/:id/submit', async (req, res) => {
    try {
        const formId = req.params.id;
        const newResponse = new Response({
            formId: formId,
            answers: req.body.answers
        });
        const savedResponse = await newResponse.save();
        res.json(savedResponse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;