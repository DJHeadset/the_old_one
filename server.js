const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors")
require("dotenv").config()
const choresRouter = require("./routes/choresRoute");
const rouletteRouter = require("./routes/rouletteRoute");
const miscRouter = require("./routes/miscRoute")
const jellyfinRouter = require("./routes/jellyfinRoute")

const allowedOrigins = [
  "http://192.168.0.38:3000",
  "http://localhost:3000",
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json());
app.use("/chores", choresRouter);
app.use("/roulette", rouletteRouter);
app.use("/misc", miscRouter)
app.use("/jellyfin", jellyfinRouter)

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
