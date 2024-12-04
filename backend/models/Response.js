const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form'
    },
    answers: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.model('Response', ResponseSchema);