const Sauce = require('../models/sauce');
const fs = require('fs'); //sert à quoi ? 



exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    //delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};



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




exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};



exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
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


exports.addLikes = (req, res, next) => {


    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                console.log("salut");

                /*let likes = sauce.likes;
                let dislikes = sauce.dislikes;
                let usersLiked = sauce.usersLiked;
                let usersDisliked = sauce.usersDisliked;
                console.log('userIdptre' + req.body.userId);
                console.log('like req = ' + req.body.like);
                console.log("likes : " + likes);
                console.log("dislikes : " + dislikes);
                console.log("usersLiked : " + usersLiked);
                console.log("usersDisliked : " + usersDisliked);

                let userLikeChoice = req.body.like;
                let add = addOneLikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(add);
                let rem = removeOneLikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(rem);
                let addDis = addOneDislikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(addDis);
                let remDis = removeOneDislikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(remDis);
                let SWD = switchToDislikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(SWD);
                let SWL = switchToLikes(likes, dislikes, usersLiked, usersDisliked, sauce.userId);
                console.log(SWL);

                usersLiked = ["333", "444"]
                let essaie2 = usersLiked.filter(item => item !== sauce.userId);
                console.log(essaie2);



                const adjustLikesResult = adjustLikes(userLikeChoice, likes, dislikes, usersLiked, usersDisliked, sauce.userId)
                console.log(adjustLikesResult);*/

                let likes = sauce.likes;
                let dislikes = sauce.dislikes;
                let usersLiked = sauce.usersLiked;
                let usersDisliked = sauce.usersDisliked;
                let userLikeChoice = req.body.like;


                console.log(sauce);
                console.log("alors 1?   " + usersLiked.includes(sauce.userId));
                const adjustLikesResult = adjustLikes(userLikeChoice, likes, dislikes, usersLiked, usersDisliked, sauce.userId)
                console.log(userLikeChoice);
                console.log(sauce);
                console.log("alors 2?   " + usersLiked.includes(sauce.userId));

                Sauce.updateOne({ _id: req.params.id }, {
                    //_id: req.params.id,
                    userId: sauce.userId,
                    name: sauce.name,
                    manufacturer: sauce.description,
                    mainPepper: sauce.mainPepper,
                    imageUrl: sauce.imageUrl,
                    heat: sauce.heat,


                    likes: adjustLikesResult.likes,
                    dislikes: adjustLikesResult.dislikes,
                    usersLiked: adjustLikesResult.usersLiked,
                    usersDisliked: adjustLikesResult.usersDisliked

                })

                .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));

            }
        })
        .catch((error) => {


            res.status(400).json({ error });
            console.log(error);

        });
};



const adjustLikes = (userLikeChoice, likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    /////////////Likes
    let adjustedLikes;
    if (usersLiked.includes(sauceId)) {

        console.log('canard');
        if (userLikeChoice === 0) {
            console.log('lapin');
            adjustedLikes = removeOneLikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        } else if (userLikeChoice === -1) {
            console.log('guepard');
            adjustedLikes = switchToDislikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        }
    }
    /////////////DIslikes
    else if (usersDisliked.includes(sauceId)) {
        if (userLikeChoice === 1) {
            adjustedLikes = switchToLikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        } else if (userLikeChoice === 0) {
            adjustedLikes = removeOneDislikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        }
    }
    /////////////No likes
    else if (!usersLiked.includes(sauceId) && !usersDisliked.includes(sauceId)) {
        if (userLikeChoice === 1) {
            adjustedLikes = addOneLikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        } else if (userLikeChoice === -1) {
            adjustedLikes = addOneDislikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        }
    }
    return adjustedLikes;
}

const addOneLikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    likes = likes + 1;
    usersLiked.push(sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}

const removeOneLikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    likes = likes - 1;
    usersLiked = usersLiked.filter(item => item !== sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}

const addOneDislikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    dislikes = dislikes + 1;
    usersDisliked.push(sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}
const removeOneDislikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    dislikes = dislikes - 1;
    usersDisliked = usersDisliked.filter(item => item !== sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}

const switchToLikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    likes = likes + 1;
    dislikes = dislikes - 1;
    usersLiked.push(sauceId);
    usersDisliked = usersDisliked.filter(item => item !== sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}

const switchToDislikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    likes = likes - 1;
    dislikes = dislikes + 1;
    usersLiked = usersLiked.filter(item => item !== sauceId);
    usersDisliked.push(sauceId);

    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}