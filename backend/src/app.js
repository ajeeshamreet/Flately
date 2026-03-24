const express = require("express");
const cors = require("cors");
const profileRoutes = require("./modules/profiles/profiles.routes");
require("dotenv").config();
const preferenceRoutes = require("./modules/preferences/preferences.routes");
const userRoutes = require("./modules/users.routes");
const matchingRoutes = require("./modules/matching/matching.routes");
const matchRoutes = require("./modules/matches/matches.routes");
const discoveryRoutes = require("./modules/discovery/discovery.routes");
const chatRoutes = require("./modules/chat/chat.routes");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit')

const app = express();
app.use(helmet());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { 
    error: 'Too many requests, please try again later.' 
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use("/matching", matchingRoutes);
app.use("/profiles", profileRoutes);
app.use("/discovery", discoveryRoutes);
app.use("/users", userRoutes);
app.use("/matches", matchRoutes);
app.use("/chat", chatRoutes);

app.use("/preferences", preferenceRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
