const fs = require("fs");
const { consoleLogger } = require("./consoleLogger");
const path = require("path");

exports.fileWriter = (filename, result) => {
  consoleLogger("Writing JSON file");

  const dirPath = "/app/www";
  const tempPath = path.join(dirPath, `${filename}.tmp`);
  const outputPath = path.join(dirPath, `${filename}.json`);

  fs.writeFileSync(tempPath, JSON.stringify(result, null, 2), "utf8");
  fs.renameSync(tempPath, outputPath);

  consoleLogger(`Chores JSON updated: ${Object.keys(result).join(", ")}`);
};
