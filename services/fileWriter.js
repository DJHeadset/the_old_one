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

  consoleLogger(`Chores JSON updated`);
};

exports.updateBackupStatus = () => {
  const fs = require("fs");

  const statusFile = "/mnt/oreg-backups/marineni/backup-status.txt";

  const status = {
    status: "FAILED",
    lastBackup: null,
    date: null,
    compose: null,
    homeassistant: null,
  };

  try {
    if (!fs.existsSync(statusFile)) {
      return status;
    }

    const content = fs.readFileSync(statusFile, "utf8");

    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.includes("SUCCESS")) {
      return status;
    }

    for (const line of lines) {
      const [key, ...value] = line.split("=");

      if (!key || value.length === 0) continue;

      const val = value.join("=");

      if (key === "timestamp") status.lastBackup = val;
      if (key === "date") status.date = val;
      if (key === "compose") status.compose = val;
      if (key === "homeassistant") status.homeassistant = val;
    }

    if (status.compose === "OK" && status.homeassistant === "OK") {
      status.status = "OK";
    }

    return status;
  } catch (err) {
    console.error("Could not read backup status:", err);
    return status;
  }
};
