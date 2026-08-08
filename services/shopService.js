const XLSX = require("xlsx");
const { getOldJson } = require("./getOldJson");
const { fileWriter } = require("./fileWriter");
const { loadWorkbook, getSheetRows } = require("./excelService");

function getShopInfo() {
  const wb = loadWorkbook();
  const tasks = getOldJson("tasks.json");
  const rows = getSheetRows(wb, "Shop");

  const shop = rows.map((row) => ({
    item: String(row[0] || "").trim(),
    points: Number(row[1] || 0),
  }));

  tasks.shop = shop;

  fileWriter("tasks", tasks);
  return shop;
}

module.exports = {
  getShopInfo,
};
