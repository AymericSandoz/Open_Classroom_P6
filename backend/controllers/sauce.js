const Sauce = require('../models/sauce');
const fs = require('fs'); //sert à quoi ? 
let usersLiked = new Array();
let usersDisliked = new Array();


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
        .then(() => { res.status(201).json({ message: 'Object saved !' }) })
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


/*exports.addLikes = (req, res, next) => {


    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {



            let likes = sauce.likes;
            let dislikes = sauce.dislikes;
            let usersLiked = sauce.usersLiked;
            let usersDisliked = sauce.usersDisliked;
            let userLikeChoice = req.body.like;
            console.log("req.auth.userId///" + req.auth.userId);
            console.log("sauce.userId///" + sauce.userId);

           
            const adjustLikesResult = adjustLikes(userLikeChoice, likes, dislikes, usersLiked, usersDisliked, req.auth.userId);
            console.log(userLikeChoice);
            

            Sauce.updateOne({ _id: req.params.id }, {
       
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

            .then(() => res.status(200).json({ message: 'Object modified!' }))
                .catch(error => res.status(401).json({ error }));

        })
        .catch((error) => {


            res.status(400).json({ error });
            console.log(error);

        });
};*/


exports.addLikes = (req, res, next) => {


    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {

            let userLikeChoice = req.body.like;
            console.log("req.auth.userId///" + req.auth.userId);
            console.log("sauce.userId///" + sauce.userId);

            console.log("sauce//" + sauce);
            adjustLikes(sauce, userLikeChoice, req.auth.userId);
            console.log(userLikeChoice);

            console.log("sauce//" + sauce)
            sauce.save()
                .then(() => { res.status(201).json({ message: 'Object saved !' }) })
                .catch(error => { res.status(400).json({ error }) })



        })
        .catch((error) => {


            res.status(400).json({ error });
            console.log(error);

        });
};


/*const adjustLikes = (userLikeChoice, likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    /////////////Likes
    let adjustedLikes = new Object();
    if (usersLiked.includes(sauceId)) {


        if (userLikeChoice === 0) {

            adjustedLikes = removeOneLikes(likes, dislikes, usersLiked, usersDisliked, sauceId);
        } else if (userLikeChoice === -1) {

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
}*/

const adjustLikes = (sauce, userLikeChoice, sauceId) => {
    console.log("On entre dans F1");
    if (userLikeChoice === 0) {

        if (sauce.usersDisliked.includes(sauceId)) {
            removeOneDislikes(sauce, sauceId);
            console.log("On entre dans F2");
        } else if (sauce.usersLiked.includes(sauceId)) {

            removeOneLikes(sauce, sauceId);
            console.log("On entre dans F3");
        }

    } else if (userLikeChoice === 1) {
        console.log("On entre dans F4");
        addOneLikes(sauce, sauceId);
    } else if (userLikeChoice === -1) {
        console.log("On entre dans F5");
        addOneDislikes(sauce, sauceId);
    }

}




const addOneLikes = (sauce, sauceId) => {
    sauce.likes++;
    sauce.usersLiked.push(sauceId);
    console.log("addOneLikes");
    console.log(sauceId + "//" + usersLiked);

}

const removeOneLikes = (sauce, sauceId) => {
    sauce.likes--;
    sauce.usersLiked = sauce.usersLiked.filter(item => item !== sauceId);
    console.log("removeOneLikes");
    console.log(sauceId + "//" + usersLiked);

}

const addOneDislikes = (sauce, sauceId) => {
    sauce.dislikes++;
    sauce.usersDisliked.push(sauceId);
    console.log("addOneDislikes");
    console.log(sauceId + "//" + usersDisliked);

}
const removeOneDislikes = (sauce, sauceId) => {
    sauce.dislikes--;
    sauce.usersDisliked = sauce.usersDisliked.filter(item => item !== sauceId);
    console.log("removeOneDislikes");
    console.log(sauceId + "//" + usersDisliked);

}

/*const switchToLikes = (likes, dislikes, usersLiked, usersDisliked, sauceId) => {
    likes = likes + 1;
    dislikes = dislikes - 1;
    usersLiked.push(sauceId);
    usersDisliked = usersDisliked.filter(item => item !== sauceId);
    console.log("switchToLikes");
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
    console.log("switchToDislikes");
    return {
        likes,
        dislikes,
        usersLiked,
        usersDisliked
    };
}*/