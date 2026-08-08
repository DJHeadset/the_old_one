const express = require("express");
const { personChange } = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);

module.exports = router;
