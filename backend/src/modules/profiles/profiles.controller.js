const profileService = require("./profiles.service");

async function getMyProfile(req, res) {
  const userId = req.userId;

  const profile = await profileService.getProfileByUserId(userId);
  res.json(profile);
}

async function saveProfile(req, res) {
  const userId = req.userId;

  const {
    age,
    gender,
    occupation,
    city,
    hasRoom
  } = req.body;

  if (!age || !gender || !occupation || !city) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const profile = await profileService.createOrUpdateProfile(userId, {
    age,
    gender,
    occupation,
    city,
    hasRoom,
    onboardingCompleted: true
  });

  res.json(profile);
}

module.exports = {
  getMyProfile,
  saveProfile
};
