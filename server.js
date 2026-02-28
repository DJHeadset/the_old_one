const express = require("express");
const app = express();
const PORT = 5000;
const choresRouter = require("./routes/choresRoute");

app.use(express.json());
app.use("/chores", choresRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
