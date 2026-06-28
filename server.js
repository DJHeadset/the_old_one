const express = require("express");
const app = express();
const PORT = 5000;
const cors = require("cors")
const choresRouter = require("./routes/choresRoute");
const rouletteRouter = require("./routes/rouletteRoute");

app.use(cors({
  origin: "http://192.168.0.38:3000",
  credentials: true
}))
app.use(express.json());
app.use("/chores", choresRouter);
app.use("/roulette", rouletteRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
