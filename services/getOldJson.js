const fs = require("fs");
const { consoleLogger } = require("../services/consoleLogger");
const path = require("path");

exports.getOldJson = (filename) => {
  const outputPath = path.join("/app/www", filename);
  consoleLogger("Getting old JSON " + filename);

  let oldJson = {};
  try {
    if (fs.existsSync(outputPath)) {
      oldJson = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    }
  } catch (error) {
    console.error("Could not load previous chores.json:", error.message);
  }
  return oldJson;
};
