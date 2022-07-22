const mongoose = require('mongoose');

const { Schema } = mongoose;

const chatScheme = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const chatModel = mongoose.model('chat', chatSchema);

module.exports = chatModel;