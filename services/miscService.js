const fs = require("fs");
const { fileWriter } = require("./fileWriter");
const { getOldJson } = require("./getOldJson");
const { choosePersonOfDay } = require("./personOfDayService");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

function skip(person) {
  const pod = getOldJson("tasks.json");
  const newTomorrow = choosePersonOfDay(pod);
  pod.tomorrow = newTomorrow.tomorrow;

  fileWriter("tasks", pod);
}

function hardDay(person) {
  const pod = getOldJson("tasks.json");
  if (person === "Apa") {
    pod.dadLast = pod.dadLast + 1;
  } else if (person === "Anya") {
    pod.momLast = pod.momLast + 1;
  } else {
    return res.status(400).json({ error: "Invalid person" });
  }
  fileWriter("tasks", pod);
}

async function pinger(ip) {
  try {
    await execFileAsync("ping", ["-c", "1", "-W", "2", ip]);

    return "ONLINE";
  } catch (err) {
    return "OFFLINE";
  }
}

function getAtticuusHdd() {
  const statusFile = "/mnt/oreg-backups/marineni/storage-status.txt";

  const hdd = {
    total: null,
    available: null,
  };

  try {
    const content = fs.readFileSync(statusFile, "utf8");

    const lines = content.split("\n").map((line) => line.trim());

    for (const line of lines) {
      if (line.startsWith("Total:")) {
        hdd.total = line.replace("Total:", "").trim();
      }

      if (line.startsWith("Available:")) {
        hdd.available = line.replace("Available:", "").trim();
      }
    }
  } catch (err) {
    console.error("Could not read Atticuus storage status:", err);
  }

  return hdd;
}

module.exports = { skip, hardDay, pinger, getAtticuusHdd };
