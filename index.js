const express = require('express');
const passport = require('passport');
const session = require('express-session');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const generalRoutes = require('./routes/generalRoutes');
const { validateToken } = require('./middlewares/validateToken');
require('dotenv').config();

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 requests per minute
    message: "Too many requests from this IP, please try again later.",
});

app.use(express.json());
app.use(cors());

// Rate limiter middleware
app.use(limiter);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI,
}, (accessToken, refreshToken, profile, done) => {
    // You can store user details in your database here
    done(null, profile);
}));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use(validateToken,generalRoutes);

// Trigger OAuth login
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}));

// Handle OAuth callback
app.get('/auth/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
    }),
    (req, res) => {
        res.redirect('/auth/profile');
    }
);

// Protected profile route
app.get('/auth/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Profile</h1><p>${JSON.stringify(req.user)}</p><a href="/logout">Logout</a>`);
});

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

const port = process.env.PORT || 3333;

app.listen(port,()=>{
    if(process.env.NODE_ENV === 'local') {
        console.log(`Server is running on port ${port}`);
    }
});