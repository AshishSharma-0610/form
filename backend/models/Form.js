const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
    title: String,
    headerImage: String,
    questions: [
        {
            type: {
                type: String,
                enum: ['Categorize', 'Cloze', 'Comprehension'],
                required: true
            },
            question: String,
            image: String,
            options: mongoose.Schema.Types.Mixed
        }
    ]
});

module.exports = mongoose.model('Form', FormSchema);