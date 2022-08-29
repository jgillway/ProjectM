const express = require('express');
const chatModel = require('../models/chatModel');

const router = express.Router();

router.post('/chat', async (request, response) => {
    if (!request.body || !request.body.message) {
        response.status(400).json({ message: 'Invalid body or refresh token', status: 400 });
    }
    else {
        const { message } = request.body;
        const { email } = request.user;
        const chat = await chatModel.create({ email, message });
        response.status(200).json({ chat, message: 'Message sent', status: 200 });
    }
});

module.exports = router;