const express = require("express");
const { personChange, getShop } = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);
router.get("/get_shop", getShop);

module.exports = router;
