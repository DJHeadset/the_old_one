const { consoleLogger } = require("../services/consoleLogger");
const { skip, hardDay } = require("../services/miscService");
const { getShopInfo } = require("../services/shopService");

function personChange(req, res, next) {
  const { person, reason } = req.body;
  if (person !== "Anya" && person !== "Apa") {
    consoleLogger("Invalid person");
    return res.status(400).json({ error: "Invalid person" });
  } else {
    if (reason === "skip") {
      skip(person);
    } else if (reason === "hard_day") {
      hardDay(person);
    } else {
      consoleLogger("Invalid reason");
    }
  }

  res.status(200).json({ person, reason });
}

function getShop(req, res, next) {
  const shop = getShopInfo();

  res.status(200).json({ shop });
}

module.exports = {
  personChange,
  getShop,
};
