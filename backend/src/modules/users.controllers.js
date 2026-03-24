const userService = require('./users.service');

async function getUserProfile(req, res) {
    try{

    const auth0User = req.auth.payload;


    const user = await userService.getOrCreateUser({
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture
    });
    res.json(user);
}catch(error){
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ error: "Internal Server Error" });
}
}

module.exports = { getUserProfile  };