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
  console.log(ip);
  try {
    await execFileAsync("ping", ["-c", "1", "-W", "2", ip]);

    return "ONLINE";
  } catch (err) {
    return "OFFLINE";
  }
}

module.exports = { skip, hardDay, pinger };
