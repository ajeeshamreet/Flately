const express = require("express");
const cors = require("cors");
// const 
const app = express();

app.use(cors());
app.use(express.json());



app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
