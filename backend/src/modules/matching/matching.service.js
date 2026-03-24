const prisma = require("../../config/prisma");  


function isEligible(userA, userB){

 // Same user
 if (userA.userId === userB.userId) return false;

 // City must match
 if (userA.city !== userB.city) return false;

 // Budget overlap
 if (
   userA.maxBudget < userB.minBudget ||
   userB.maxBudget < userA.minBudget
 ) {
   return false;
 }
 // Gender preference
 if (
    userA.genderPreference !== "any" &&
    userA.genderPreference !== userB.gender
  ) {
    return false;
  }

  if (
    userB.genderPreference !== "any" &&
    userB.genderPreference !== userA.gender
  ) {
    return false;
  }
    return true;



}


/**
 * SOFT SIGNAL SCORING (0–1)
 */
function similarityScore(a, b, max = 5) {
    return 1 - Math.abs(a - b) / max;
  }
  
  function booleanScore(a, b) {
    return a === b ? 1 : 0;
  }
  
  
/**
 * FINAL COMPATIBILITY SCORE (0–100)
 */

function calculateScore(prefA,prefB){
    const cleanliness =
    similarityScore(prefA.cleanliness, prefB.cleanliness) *
    prefA.weightCleanliness;

    const sleep =  similarityScore(prefA.sleepSchedule, prefB.sleepSchedule) *
    prefA.weightSleep;

    const habits =
    ((booleanScore(prefA.smoking, prefB.smoking) +
      booleanScore(prefA.drinking, prefB.drinking)) /
      2) *
    prefA.weightHabits;

    const social =
    similarityScore(prefA.socialLevel, prefB.socialLevel) *
    prefA.weightSocial;
    return Math.round(
        cleanliness + sleep + habits + social
      );

}


async function findMatchesForUser(userId){


    // finding the data about my current user 
    const userProfile = await prisma.profile.findUnique({
        where : { userId}
    })
    const userPref = await prisma.preference.findUnique({
        where : { userId}
    })

    if(!userProfile || !userPref){
        throw new Error("PROFILE_OR_PREFERENCES_MISSING");
    }

    const candidates = await prisma.profile.findMany({
        where : {
            userId : { not : userId}
        },
        include: {
            user: true  
        }
    });
    const candidatePrefs = await prisma.preference.findMany();

    const results=[]
    for (const candidate of candidates){

        const candidatePref = candidatePrefs.find(
            p => p.userId === candidate.userId 
        )

        if (!candidatePref){
            continue;
        }


        const eligible = isEligible(
            {
                ...userProfile,
                ...userPref
            },
            {
                ...candidate,
                ...candidatePref
            }

        )

        if(!eligible){
            continue;
        }
        const score = calculateScore(userPref, candidatePref);

        results.push({
            userId: candidate.userId,
            score
          });


    }   


    return results.sort((a,b)=> b.score - a.score);
}


module.exports = {
    findMatchesForUser}