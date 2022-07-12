const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); //ça sert à quoi ça ? 
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');



mongoose.connect('mongodb+srv://sandozaymeric:OpenClassroomPassword@cluster0.znqu1dh.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use(express.json()); //Recupere requette au format json et les transfere dans req.body

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