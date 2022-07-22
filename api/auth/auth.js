const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('../models/userModel');

//handling user registration
passport.use('signup', new localStrategy.Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
}, async (request, email, password, done) => {
    try {
        const { username } = request.body;
        const user = await userModel.create({ email, password, username });
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

//handling user login
passport.use('login', new localStrategy.Strategy({
    usernameField: 'username',
    passwordField: 'password'
}, async ( username, password, done) => {
    try {
        const user = await userModel.findOne({ username });
        if(!user) {
            return done(new Error('user not found'), false);
        }
        const valid = await user.isValidPassword(password);
        if(!valid) {
            return done(new Error('Invalid password'), false);
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));