const express = require("express");
const router = express.Router();
const {
  completeChore,
  regenerateChores,
  resetHourly,
  resetMidnight,
  scoreUpdate,
} = require("../controllers/choresController");

router.route("/complete_chore", completeChore);
router.route("/update_chore", regenerateChores);
router.route("/update_hourly", resetHourly);
router.route("/update_midnight", resetMidnight);
router.route("/update_score", scoreUpdate);

module.exports = router;
