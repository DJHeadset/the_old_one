const XLSX = require("xlsx");
const EXCEL_PATH = "/app/excel/NapirendTest.xlsx";

function loadWorkbook() {
  return XLSX.readFile(EXCEL_PATH);
}

function getSheetRows(workbook, sheetName) {
  if (!workbook.Sheets[sheetName]) {
    return [];
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
  });
}

module.exports = {
  loadWorkbook,
  getSheetRows,
};
