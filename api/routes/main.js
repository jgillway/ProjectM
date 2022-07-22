const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/', (request, response) => {
    response.send('Hello world');
});

router.get('/status', (request, response) => {
    response.status(200).json({ message: 'Ok', status: 200 });
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (request, response, next) => {
    response.status(200).json({ message: 'Signup successful', status: 200 });
});

router.post('/login', async (request, response, next) => {
    passport.authenticate('login', async (error, user) => {
        try {
            if (error) {
                return next(error);
            }

            if (!user) {
                return next(new Error('Username and Password are required!'));
            }

            request.login(user, { session: false }, (err) => {
                if (err) return next(err);
                return response.status(200).json({ user, status: 200 });
            });
        } catch (err) {
            console.log(err);
            return next(err);
        }
    })(request, response, next);
});

router.post('/logout', (request, response) => {
    if (!request.body) {
        response.status(400).json({ message: 'Invalid body', status: 400 });
    }
    else {
        response.status(200).json({ message: 'Ok', status: 200 });
    }
});

router.post('/token', (request, response) => {
    if (!request.body || !request.body.refreshToken) {
        response.status(400).json({ message: 'Invalid body or refresh token', status: 400 });
    }
    else {
        const { refreshToken } = request.body;
        response.status(200).json({ message: `Refresh token requested for token: ${refreshToken}`, status: 200 });
    }
});

module.exports = router;