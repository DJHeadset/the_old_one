const express = require("express");
const { generateChoresJson } = require('./scripts/generateChoresJson');
const { kidCompleteChore } = require("./scripts/kidCompleteChore");
const { updateHourly, updateScore, updateMidnight } = require("./scripts/updateScore");

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/complete_chore', (req, res) => {
  const payload = req.body;
  kidCompleteChore(payload)
  res.status(200)
});

app.post('/update_chore', (req, res) => {
  generateChoresJson();
  res.status(200);
});

app.post('/update_hourly', (req, res) => {
  updateHourly()
  res.status(200)
})

app.post('/update_midnight', (req, res) => {
  updateMidnight()
  res.status(200)
})

app.post('/update_score', (req, res) => {
  const payload = req.body;
  updateScore(payload)
  res.status(200)
})

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();