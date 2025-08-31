const path = require("path")
const fs = require("fs");
const { consoleLogger } = require("./consoleLogger");

exports.fileLogger = (message) => {
  const logDir = path.join(require("os").homedir(), "Desktop");
  const logFile = path.join(logDir, "Az Oreg Naploja.txt");

  const timeStamp = new Date().toLocaleString("hu-HU")
  const logEntry = `[${timeStamp}] ${message}`

  try {
    fs.appendFileSync(logFile, logEntry +"\n", "utf8")
    consoleLogger(`${logEntry}`)
  } catch (err) {
    console.error("Error writing log file:", err);
  }
}