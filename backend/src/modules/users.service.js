const prisma = require('../config/prisma');

async function getOrCreateUser(data) {
    let user = await prisma.user.findUnique({
        where: { auth0Id: data.auth0Id }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                auth0Id: data.auth0Id,
                email: data.email,
                name: data.name,
                picture: data.picture
            }
        });
    }

    return user;
}

module.exports = { getOrCreateUser };