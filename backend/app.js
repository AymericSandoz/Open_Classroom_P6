const express = require('express');
const mongoose = require('mongoose'); //Mongoose est un package qui facilite les interactions avec notre base de données MongoDB. 
const path = require('path'); //accéder au path de notre serveur :
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');
var helmet = require('helmet');
var session = require('cookie-session');

const dotenv = require("dotenv").config(); // Mettre l'url de connexion de mongoDB dans un fichier à part



//Coonexion à MONGODB
mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();


app.use(express.json()); //Avec ceci, Express prend toutes les requêtes qui ont comme Content-Type  application/json  et met à disposition leur  body  directement sur l'objet req



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
        secure: true, //Garantit que le navigateur n’envoie le cookie que sur HTTPS.
        httpOnly: true, //Garantit que le cookie n’est envoyé que sur HTTP(S), pas au JavaScript du client, ce qui renforce la protection contre les attaques de type cross-site scripting.
        expires: expiryDate //Utilisez cette option pour définir la date d’expiration des cookies persistants.
    }
}));

//Supprime erreurs de CORS ! CORS signifie « Cross Origin Resource Sharing ». Il s'agit d'un système de sécurité qui, par défaut, bloque les appels HTTP entre des serveurs différents, ce qui empêche donc les requêtes malveillantes d'accéder à des ressources sensibles
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //accéder à notre API depuis n'importe quelle origine ( '*' ) 
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); //ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); //envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.
    next();
});



app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images'))); //Cela indique à Express qu'il faut gérer la ressource images de manière statique (un sous-répertoire de notre répertoire de base, __dirname) à chaque fois qu'elle reçoit une requête vers la route /images. 

module.exports = app;