const express = require("express");
const { generateChoresJson } = require('./scripts/generateChoresJson');
const { kidCompleteChore } = require("./scripts/kidCompleteChore");
const { updateScore } = require("./scripts/updateScore");
const { consoleLogger } = require("./services/consoleLogger");

const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/complete_chore', (req, res) => {
  const payload = req.body;
  consoleLogger(`Received chore completion: ${payload}`);

  kidCompleteChore(payload)
  res.status(200)
});

app.post('/update_chore', (req, res) => {
  generateChoresJson();
  res.status(200).json({ message: 'Chore JSON updated successfully' });
});

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