const path = require("path")
const fs = require("fs");
const { consoleLogger } = require("./consoleLogger");

exports.fileLogger = (message) => {
  const logDir = '/app/logs';

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }


  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const logFile = path.join(logDir, `${year}_${month}.txt`);

  const timeStamp = new Date().toLocaleString("hu-HU")
  const logEntry = `[${timeStamp}] ${message}`

  try {
    let oldContent = "";
    if (fs.existsSync(logFile)) {
      oldContent = fs.readFileSync(logFile, "utf8");
    }

    const newContent = logEntry + "\n" + oldContent;
    fs.writeFileSync(logFile, newContent, "utf8");

    consoleLogger(logEntry);
  } catch (err) {
    console.error("Error writing log file:", err);
  }
}