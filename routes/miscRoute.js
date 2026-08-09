const express = require("express");
const {
  personChange,
  getShop,
  titleChange,
} = require("../controllers/miscController");
const router = express.Router();

router.post("/person_of_day", personChange);
router.get("/get_shop", getShop);

router.post("/change_tittle", titleChange);

module.exports = router;
