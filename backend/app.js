const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); //ça sert à quoi ça ? 
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
var helmet = require('helmet');
var session = require('cookie-session');

const dotenv = require("dotenv").config(); // Mettre l'url de connexion de mongoDB dans un fichier à part

console.log(process.env.MONGO_URL);


mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


app.use(express.json()); //Recupere requette au format json et les transfere dans req.body



// Sets all of the defaults, but overrides `script-src` and disables the default `style-src`
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "script-src": ["'self'", "http://localhost:4200/"],
            "style-src": null,
        },
    })
);


//express rate limiter 
var client = require('redis').createClient();

var limiter = require('express-limiter')(app, client);
limiter({
    path: '/api/action',
    method: 'get',
    lookup: ['connection.remoteAddress'],
    // 500 requests per hour
    total: 500,
    expire: 1000 * 60 * 60
})

app.get('/api/action', function(req, res) {
    res.send(200, 'ok')
})

//cookie
var expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
app.use(session({
    name: 'session',
    keys: ['key1', 'key2'],
    cookie: {
        secure: true,
        httpOnly: true,
        expires: expiryDate
    }
}));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});



app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images'))); //pas compris non plus

module.exports = app;