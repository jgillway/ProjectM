const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const tokenList = {};
const router = express.Router();

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

                //create jwt
                const body = {
                    _id: user._id,
                    email: user.email,
                    name: user.username,
                };

                const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });
                const refreshToken = jwt.sign({ user: body }, process.env.JWT_REFRESH_SECRET, { expiresIn: 86400 });

                //store token in cookies
                response.cookie('jwt', token);
                response.cookie('refreshJwt', refreshToken);

                //store tokens in memory
                tokenList[refreshToken] = {
                    token,
                    refreshToken,
                    email: user.email,
                    _id: user._id,
                    name: user.username,
                };

                return response.status(200).json({ token, refreshToken, status: 200 });
            });
        } catch (err) {
            return next(err);
        }
    })(request, response, next);
});

router.route('/logout')
    .get(processLogoutRequest)
    .post(processLogoutRequest);

router.post('/token', (request, response) => {
    const { refreshToken } = request.body;

    if(refreshToken in tokenList) {
        const body = {
            _id: tokenList[refreshToken]._id,
            email: tokenList[refreshToken].email,
            name: tokenList[refreshToken].name,
        };
        const token = jwt.sign({ user: body }, process.env.JWT_SECRET, { expiresIn: 300 });

        //update jwt
        response.cookie('jwt', token);
        tokenList[refreshToken].token = token;

        response.status(200).json({ token, status: 200 });
    }
    else {
        response.status(401).json({ message: 'Unauthorized', status: 401 });
    }
});

function processLogoutRequest(request, response){
    if(request.cookies) {
        const refreshToken = request.cookies.refreshJwt;
        if(refreshToken in tokenList) delete tokenList[refreshToken];
        response.clearCookie('jwt');
        response.clearCookie('refreshJwt');
    }
    if(request.method === 'POST') {
        response.status(200).json({ message: 'Logged out', status: 200 });
    }
    else if(request.method === 'GET') {
        response.sendFile('logout.html', { root: './public' });
    }
    
}

module.exports = router;