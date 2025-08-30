const path = require("path")
const fs = require("fs");
const { consoleLogger } = require("./consoleLogger");

exports.fileLogger = (message) => {
  const logDir = path.join(require("os").homedir(), "Desktop");
  console.log(logDir)
  const logFile = path.join(logDir, "chore_failures.txt");
  console.log(logFile)

  const timeStamp = new Date().toLocaleDateString("hu-HU")
  const logEntry = `[${timeStamp}] ${message}`

  try {
    fs.appendFileSync(logFile, logEntry, "utf8")
    consoleLogger(`${logEntry}`)
  } catch (err) {
    console.error("Error writing log file:", err);
  }
}