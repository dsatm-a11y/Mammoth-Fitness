const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workoutRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const communityRoutes = require('./routes/communityRoutes');

require('dotenv').config();

const app = express();

//MIDDLEWARE
app.use(express.urlencoded( { extended: true } ));
app.use(express.json());
app.use(session( {
    secret: process.env.SESSION_SECRET, //Secret password used by dotenv probably
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
} ));
app.use(express.static(path.join(__dirname, '../public')));
//END OF MIDDLEWARE



//ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/homepage.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
})
app.use(authRoutes);
app.use('/api', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);

// END OF ROUTES

//STARTING SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});