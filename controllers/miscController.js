const { consoleLogger } = require("../services/consoleLogger");
const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");
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

function titleChange(req, res, next) {
  const { kid, title } = req.body;
  console.log(`${kid} -> ${title}`);

  const chores = getOldJson("chores.json");

  if (!chores[kid]) {
    return res.status(404).json({
      error: `Kid not found: ${kid}`,
    });
  }

  chores[kid].activeTitle = title;

  fileWriter("chores", chores);

  return res.status(200).json({
    kid,
    title,
  });
}

module.exports = {
  personChange,
  getShop,
  titleChange,
};
