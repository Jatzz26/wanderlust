if (process.env.NODE_ENV !== 'Production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const listroute = require('./routes/listing');
const reviewroute = require('./routes/review');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const User = require('./models/user.js');
const LocalStrategy = require('passport-local');
const userRoute = require('./routes/user.js');

// Template Engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Correct single dbUrl
const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
});

store.on('error', function (e) {
    console.log('Session Store Error', e);
});

// Session Configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    }
};

store.on('error', function (e) {
    console.log('Session Store Error', e);
});

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Messages & Current User
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.curruser = req.user || null;
    next();
});

// MongoDB Connection
async function main() {
    await mongoose.connect(dbUrl);
    console.log('Connected to the Database');
}
main().catch((err) => {
    console.error('Database connection error:', err);
});

// Health Check Endpoint (for Kubernetes & container probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
// Routes
app.use('/', userRoute);
app.use('/listings', listroute);
app.use('/listings/:id/review', reviewroute);

// 404 Error Handler (Page Not Found)
app.all('*', (req, res, next) => {
    const err = new Error("Page Not Found");
    err.status = 404;
    next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("listings/error", { err });
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App is Listening at port ${PORT}`);
});
