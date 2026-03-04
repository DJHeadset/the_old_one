const express = require("express");
const router = express.Router();
const {
  todaysWinner,
  yesterdaysChoices,
} = require("../controllers/rouletteController");

router.get("/yesterday_choices", yesterdaysChoices);
router.post("/todays_winner", todaysWinner);

module.exports = router;
