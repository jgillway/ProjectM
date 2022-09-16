import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import routes from './routes/main';
import passwordRoutes from './routes/password';
import secureRoutes from './routes/secure';

const app = express();
const port = process.env.PORT || 3000;

// setup mongo connection
const uri = process.env.MONGO_CONNECTION_URL;
if (process.env.MONGO_USER_NAME && process.env.MONGO_PASSWORD) {
  const mongoConfig = {
    auth: { authSource: 'admin' },
    user: process.env.MONGO_USER_NAME,
    pass: process.env.MONGO_PASSWORD,
  };
  mongoose.connect(uri, mongoConfig);
}
else {
  mongoose.connect(uri);
}

mongoose.connection.on('error', (error) => {
  console.log(error);
  process.exit(1);
});

// update express settings
// parse application/x-www-form-urlencoded data
app.use(bodyParser.urlencoded({ extended: false }));
// parse application json data
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({ credentials: true, orgin: process.env.CORS_ORGIN }));

// require passport auth
require('./auth/auth');

app.get('/game.html', passport.authenticate('jwt', { session: false }) ,(request, response) => {
  response.status(200).json(request.user);
});

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (request, response) => {
  response.send(path.join(__dirname, '/index.html'));
});

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// catch all other routes
app.use((request, response) => {
  response.status(404).json({ message: '404 - Not Found', status: 404 });
});

// handle errors
app.use((error, request, response, next) => {
  console.log(error);
  response.status(error.status || 500).json({ error: error.message, status: 500 });
});

mongoose.connection.on('connected', () => {
  console.log('connected to mongo');
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
