const service = require('./preferences.service');

async function getMyPreferences(req,res){
    const prefs = await service.getPreferences(req.userId);
    res.json(prefs)
}


async function saveMyPreferences (req,res){
    try{
        const prefs = await service.savePreferences(req.userId, req.body);
        res.json(prefs);
    } catch (error){
        if(error.message === "INVALID_WEIGHTS"){
            return res.status(400).json({error : "Weights must sum to 100"});
        }
        res.status(500).json({ message: "Failed to save preferences" });
    }
}

module.exports = {
    getMyPreferences,
    saveMyPreferences
};

