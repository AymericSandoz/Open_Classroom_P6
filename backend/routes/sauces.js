const express = require('express');
const router = express.Router(); //création d'un routeur express dans lequel on va enregistrer nos routes

//Importations des middleware
const auth = require('../middleware/auth'); //authentifications
const multer = require('../middleware/multer-config'); //gestions des images

//Importation controllers
const stuffCtrl = require('../controllers/sauce');

//Routes
router.get('/', auth, stuffCtrl.getAllSauces); //Récupération de toute les sauces
router.post('/', auth, multer, stuffCtrl.createSauce); //Création de sauce
router.get('/:id', auth, stuffCtrl.getOneSauce); //Récupération d'une sauce
router.put('/:id', auth, multer, stuffCtrl.modifySauce); //modifiation d'une sauce
router.delete('/:id', auth, stuffCtrl.deleteSauce); //supprimer une sauce
router.post('/:id/like', auth, stuffCtrl.addLikes); //Gestion des likes et dislikes

module.exports = router; //exportations de notre routeur