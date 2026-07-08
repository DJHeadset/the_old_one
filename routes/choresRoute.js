const express = require("express");
const router = express.Router();
const {
  completeChore,
  regenerateChores,
  resetHourly,
  resetMidnight,
  scoreUpdate,
  extraChoreComplete,
  serveChore,
} = require("../controllers/choresController");

router.get("/get_chores", serveChore);
router.post("/complete_chore", completeChore);
router.post("/extra_chore", extraChoreComplete);
router.post("/update_chore", regenerateChores);
router.post("/update_hourly", resetHourly);
router.post("/update_midnight", resetMidnight);
router.post("/update_score", scoreUpdate);

module.exports = router;
