const express = require('express');
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

const userModel = require('../models/userModel');

const email = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;

const smtpTransport = nodemailer.createTransport({
    service: process.env.EMAIL_PROVIDER,
    auth: {
        user: email,
        pass: emailPassword,
    },
});

const handlebarsOptions = {
    viewEngine: {
        extName: '.hbs',
        defaultLayout: null,
        partialsDir: './templates/',
        layoutsDir: './templates/',
    },
    viewPath: path.resolve('./templates/'),
    extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

const router = express.Router();

router.post('/forgot-password', async (request, response) => {
    const userEmail = request.body.email;
    const user = await userModel.findOne({ email: userEmail });
    if(!user) {
        response.status(400).json({ message: 'Invalid email', status: 400 });
        return;
    }

    //create user token
    const buffer = crypto.randomBytes(20);
    const token = buffer.toString('hex');

    //update user reset token and exp date
    await userModel.findByIdAndUpdate({ _id: user._id }, { resetToken: token, resetTokenExp: Date.now() + 600000 });

    //send user password reset email
    const emailOptions = {
        to: userEmail,
        from: email,
        template: 'forgotPassword',
        subject: 'Password Reset',
        context: {
            name: user.username,
            url: `http://localhost:${process.env.PORT || 3000}/reset-password.html?token=${token}`,
        },
    };
    await smtpTransport.sendMail(emailOptions);

    response.status(200).json({ message: 'An email has been sent to your email address. Password reset link is only valid for 10 minutes.', status: 200 });
});

router.post('/reset-password', async (request, response) => {
    const userEmail = request.body.email;
    const user = await userModel.findOne({ resetToken: request.body.token, resetTokenExp: { $gt: Date.now() }, email: userEmail });
    if(!user) {
        response.status(400).json({ message: 'Invalid token', status: 400 });
        return;
    }

    //ensure password was provided and matches verification 
    if(!request.body.password || !request.body.verifiedPassword || request.body.password !== request.body.verifiedPassword) {
        response.status(400).json({ message: 'Passwords do not match or were not provided', status: 400 });
        return;
    }

    //update user model
    user.password = request.body.password;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    //send user password reset update email
    const emailOptions = {
        to: userEmail,
        from: email,
        template: 'resetPassword',
        subject: 'Password Reset Confirmation',
        context: {
            name: user.username,
        },
    };
    await smtpTransport.sendMail(emailOptions);
    
    response.status(200).json({ message: 'Password Updated.', status: 200 });
});

module.exports = router;