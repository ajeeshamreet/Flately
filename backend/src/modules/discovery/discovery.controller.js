const service = require('./discovery.service');

async function getFeed(req,res){
    const feed = await service.getDiscoveryFeed(req.userId);
    res.json(feed);
}

async function swipe(req,res){

    const { toUserId, action } = req.body;

    if(!['like','dislike'].includes(action)){
        return res.status(400).json({ error: 'Invalid action' });
    }

    await service.swipeUser(req.userId, toUserId, action);
    res.json({ success: true });


}


module.exports = {
    getFeed,
    swipe
}