const express = require('express');
const router = express.Router(); //création d'un routeur express dans lequel on va enregistrer nos routes

//Importation controller
const userCtrl = require('../controllers/user');

//Routes
router.post('/signup', userCtrl.signup); //Inscriptions
router.post('/login', userCtrl.login); //COnnexion

module.exports = router; //exportations de notre routeur