const express = require("express");
const router = express.Router();
const {
  completeChore,
  regenerateChores,
  resetHourly,
  resetMidnight,
  scoreUpdate,
} = require("../controllers/choresController");

router.post("/complete_chore", completeChore);
router.post("/update_chore", regenerateChores);
router.post("/update_hourly", resetHourly);
router.post("/update_midnight", resetMidnight);
router.post("/update_score", scoreUpdate);

module.exports = router;
