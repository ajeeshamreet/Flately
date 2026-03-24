const matchService = require('./matches.service')


async function getMyMatches(req, res) {

    const matches = await matchService.getMyMatches(req.userId);
    res.json(matches);


}

module.exports = {getMyMatches}