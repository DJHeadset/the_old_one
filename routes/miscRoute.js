const express = require("express");
const {
  personChange,
  getShop,
  titleChange,
  shopping,
  pillHandler,
  getHouseStatus,
  getPiHole,
} = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);
router.get("/get_shop", getShop);
router.get("/get_status", getHouseStatus);
router.post("/buy_shop", shopping);
router.post("/pills", pillHandler);
router.post("/change_tittle", titleChange);
router.get("/get_pihole", getPiHole);

module.exports = router;
