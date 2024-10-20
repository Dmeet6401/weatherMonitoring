const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

const sessionMiddleware = (app) => {
  app.use(cookieParser());
  app.use(session({
    secret: secretKey, // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 5 * 60 * 1000 } // Session expires in 5 minutes
  }));
};

module.exports = sessionMiddleware;
