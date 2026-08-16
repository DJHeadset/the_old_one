const express = require("express");
const {
  personChange,
  getShop,
  titleChange,
  shopping,
} = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);
router.get("/get_shop", getShop);
router.post("/buy_shop", shopping);

router.post("/change_tittle", titleChange);

module.exports = router;
