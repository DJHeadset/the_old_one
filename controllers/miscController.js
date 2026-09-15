const { consoleLogger } = require("../services/consoleLogger");
const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");
const {
  skip,
  hardDay,
  pinger,
  getAtticuusHdd,
} = require("../services/miscService");
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

async function getHouseStatus(req, res, next) {
  //console.log("House Status")
  const data = getOldJson("house_status.json");
  const [internet, atticuus] = await Promise.all([
    pinger("1.1.1.1"),
    pinger("192.168.0.150"),
  ]);

  data.internet = internet;
  data.atticuus = atticuus;
  data.atticuus_hdd = getAtticuusHdd();
  //console.log(data);
  res.status(200).json({ data });
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

function shopping(req, res) {
  const { kid, item } = req.body;

  const chores = getOldJson("chores.json");

  // Find kid
  const kidData = chores[kid];

  // Find item in shop
  const shop = getShopInfo();
  const shopItem = shop.find((x) => x.item === item);

  if (!kidData || !shopItem) {
    return res.status(400).json({
      error: "Invalid kid or item",
    });
  }

  const price = shopItem.points;

  if (kidData.gold < price) {
    return res.status(400).json({
      error: "Not enough gold",
      gold: kidData.gold,
    });
  }

  kidData.gold -= price;

  fileWriter("chores", chores);

  return res.status(200).json({
    success: true,
    gold: kidData.gold,
  });
}

function pillHandler(req, res) {
  //console.log(req.body);

  const { item, boxes, amount } = req.body;

  const tasks = getOldJson("tasks.json");

  const medication = tasks.medications[item];

  if (!medication) {
    return res.status(404).json({
      success: false,
      error: "Medication not found",
    });
  }

  if (amount !== undefined) {
    medication.quantity -= Number(amount);
  } else {
    medication.quantity += Number(boxes) * medication.perBox;
  }

  fileWriter("tasks", tasks);

  return res.status(200).json({
    success: true,
    item,
    quantity: medication.quantity,
  });
}

module.exports = {
  personChange,
  getShop,
  getHouseStatus,
  titleChange,
  shopping,
  pillHandler,
};
