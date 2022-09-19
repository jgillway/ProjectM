import passport from 'passport';
import localStrategy from 'passport-local';
import jwtStrategy from 'passport-jwt';
import UserModel from '../models/UserModel';

// handling user registration
passport.use('signup', new localStrategy.Strategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
}, async (request, email, password, done) => {
  try {
    const { username } = request.body;
    const user = await UserModel.create({ email, password, username });
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// handling user login
passport.use('login', new localStrategy.Strategy({
  usernameField: 'username',
  passwordField: 'password',
}, async (username, password, done) => {
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return done(new Error('user not found'), false);
    }
    const valid = await user.isValidPassword(password);
    if (!valid) {
      return done(new Error('Invalid password'), false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// verify jwt token
passport.use(new jwtStrategy.Strategy({
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: (request) => {
    let token = null;
    if (request && request.cookies) {
      token = request.cookies.jwt;
    }
    return token;
  },
}, async (token, done) => {
  try {
    return done(null, token.user);
  } catch (error) {
    return done(error);
  }
}));
