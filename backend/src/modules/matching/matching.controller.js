const matchingService = require('./matching.service');

async function getMatches(req, res) {
    try {

        
        const matches = await matchingService.findMatches(req.userId);
        res.json(matches);




    }    catch (err) {
        if (err.message === "PROFILE_OR_PREFERENCES_MISSING") {
          return res.status(400).json({
            message: "Complete profile and preferences first"
          });
        }
    
        res.status(500).json({ message: "Matching failed" });
      }
    }
    
    module.exports = { getMatches };