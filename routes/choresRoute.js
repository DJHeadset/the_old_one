const express = require("express");
const router = express.Router();
const {
  completeChore,
  regenerateChores,
  resetHourly,
  resetMidnight,
  extraChoreComplete,
  serveChore,
  punishment,
} = require("../controllers/choresController");

router.get("/get_chores:filename", serveChore);
router.post("/complete_chore", completeChore);
router.post("/extra_chore", extraChoreComplete);
router.post("/update_chore", regenerateChores);
router.post("/update_hourly", resetHourly);
router.post("/update_midnight", resetMidnight);
router.post("/punishment", punishment);

module.exports = router;
