const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

app.post("/complete_chore", (req, res) => {
  const payload = req.body;
  console.log("Received chore completion:", payload);
  
  // Optionally respond to Home Assistant
  res.status(200).json({ message: "Chore received", received: payload });
});

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