const prisma = require("../../config/prisma");

function validateWeights(weights){
    const total = weights.weightCleanliness + weights.weightSleep + weights.weightHabits + weights.weightSocial

    return total === 100;
}
async function getPreferences(userId){
    const preferences = await prisma.preference.findUnique({
        where : {
            userId : userId
        }
    })
    return preferences;
}

async function savePreferences(userId, data){
     if(!validateWeights(data)){
        throw new Error("INVALID_WEIGHTS");
     }
     const existing = await prisma.preference.findUnique({
        where: { userId }
      });
    
      if (existing) {
        return prisma.preference.update({
          where: { userId },
          data
        });
      }
    
      return prisma.preference.create({
        data: { ...data, userId }
      });
    }
    
    module.exports = {
      getPreferences,
      savePreferences
    };