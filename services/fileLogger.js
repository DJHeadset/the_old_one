const fs = require("fs");
const path = require("path");

const { consoleLogger } = require("./consoleLogger");
const { getOldJson } = require("./getOldJson");
const { fileWriter } = require("./fileWriter");

exports.fileLogger = (message) => {
  const logDir = "/app/logs";
  const maxMessages = 10;

  try {
    fs.mkdirSync(logDir, { recursive: true });

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const logFile = path.join(logDir, `${year}_${month}.txt`);

    const timeStamp = now.toLocaleString("hu-HU");
    const logEntry = `[${timeStamp}] ${message}`;

    // 1. Monthly log
    fs.appendFileSync(logFile, logEntry + "\n", "utf8");

    // 2. Rolling frontend messages
    let messages = getOldJson("last_messages.json");

    if (!Array.isArray(messages)) {
      messages = [];
    }

    messages.push({
      timestamp: now.toISOString(),
      displayTime: timeStamp,
      message: String(message),
    });

    if (messages.length > maxMessages) {
      messages = messages.slice(-maxMessages);
    }

    fileWriter("last_messages", messages);

    // 3. Console
    consoleLogger(logEntry);
  } catch (err) {
    console.error("Error writing log:", err);
  }
};
