const express = require("express");
const {
  personChange,
  getShop,
  titleChange,
  shopping,
  pillHandler,
  getHouseStatus,
} = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);
router.get("/get_shop", getShop);
router.get("/get_status", getHouseStatus);
router.post("/buy_shop", shopping);
router.post("/pills", pillHandler);
router.post("/change_tittle", titleChange);

module.exports = router;
