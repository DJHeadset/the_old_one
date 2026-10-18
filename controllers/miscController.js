const { consoleLogger } = require("../services/consoleLogger");
const { getCurrentThings } = require("../services/currentThingsService");
const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");
const {
  skip,
  hardDay,
  pinger,
  getAtticuusHdd,
} = require("../services/miscService");
const { getPiHoleInfo } = require("../services/piHoleService");
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
  const data = getOldJson("house_status.json");
  const [internet, atticuus] = await Promise.all([
    pinger("1.1.1.1"),
    pinger("192.168.0.150"),
  ]);

  data.internet = internet;
  data.atticuus = atticuus;
  if (atticuus === "ONLINE") {
    data.atticuus_hdd = getAtticuusHdd();
  } else {
    data.atticuus_hdd = {};
  }
  res.status(200).json({ data });
}

function titleChange(req, res, next) {
  const { kid, title } = req.body;

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
  const { item, boxes, amount } = req.body;

  const tasks = getOldJson("tasks.json");
  const houseStatus = getOldJson("house_status.json");

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

  houseStatus.medications = tasks.medications;
  fileWriter("house_status", houseStatus);

  return res.status(200).json({
    success: true,
    item,
    quantity: medication.quantity,
  });

  return res.status(200).json({
    success: true,
    item,
    quantity: medication.quantity,
  });
}

async function getPiHole(req, res, next) {
  try {
    const info = await getPiHoleInfo();
    res.status(200).json({ data: info });
  } catch (error) {
    console.error("Pi-hole status check failed:", error.message);

    res.status(503).json({
      data: {
        online: false,
        dns: false,
        dhcp: false,
      },
      error: "Pi-hole status unavailable",
    });
  }
}

function serveCurrentThings(req, res, next) {
  try {
    const trends = getCurrentThings();

    if (!trends || !Array.isArray(trends.current_things)) {
      return res.status(404).json({
        success: false,
        message: "Current trends are not available yet",
      });
    }

    return res.json(trends);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  personChange,
  getShop,
  getHouseStatus,
  titleChange,
  shopping,
  pillHandler,
  getPiHole,
  serveCurrentThings,
};
