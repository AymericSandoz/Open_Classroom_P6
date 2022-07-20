const Sauce = require('../models/sauce');
const fs = require('fs'); //accès aux fonctions qui nous permettent de modifier le système de fichiers, y compris aux fonctions permettant de supprimer les fichiers.
let usersLiked = new Array();
let usersDisliked = new Array();

//créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Object saved !' }) })
        .catch(error => { res.status(400).json({ error }) })
};


//récupérer une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};



//Modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    delete sauceObject._userId; //éviter de changer le propriétaire de la sauce
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) { //S'assurer que c'est bien le propriétaire de la sauce
                res.status(403).json({ message: 'unauthorized request' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Object modified!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};


//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: ' unauthorized request' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Object deleted !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};


//Gestion des likes
exports.addLikes = (req, res, next) => {


    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
        let userLikeChoice = req.body.like;
          
        adjustLikes(sauce, userLikeChoice, req.auth.userId);
            
        sauce.save()
                .then(() => { res.status(201).json({ message: 'Object saved !' }) })
                .catch(error => { res.status(400).json({ error }) })

        })
        .catch((error) => {
                res.status(400).json({ error });

        });
};


//Fonction pour ajouter des likes ou retirer des likes
const adjustLikes = (sauce, userLikeChoice, sauceId) => {

    if (userLikeChoice === 0) {

        if (sauce.usersDisliked.includes(sauceId)) {
            removeOneDislikes(sauce, sauceId);
           
        } else if (sauce.usersLiked.includes(sauceId)) {

            removeOneLikes(sauce, sauceId);
           
        }

    } else if (userLikeChoice === 1) {
      
        addOneLikes(sauce, sauceId);
    } else if (userLikeChoice === -1) {
       
        addOneDislikes(sauce, sauceId);
    }

}




const addOneLikes = (sauce, sauceId) => {
    sauce.likes++;
    sauce.usersLiked.push(sauceId);
}

const removeOneLikes = (sauce, sauceId) => {
    sauce.likes--;
    sauce.usersLiked = sauce.usersLiked.filter(item => item !== sauceId);
}

const addOneDislikes = (sauce, sauceId) => {
    sauce.dislikes++;
    sauce.usersDisliked.push(sauceId);
}
const removeOneDislikes = (sauce, sauceId) => {
    sauce.dislikes--;
    sauce.usersDisliked = sauce.usersDisliked.filter(item => item !== sauceId);

}
