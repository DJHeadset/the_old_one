const { fileWriter } = require("./fileWriter");
const { getOldJson } = require("./getOldJson");
const { choosePersonOfDay } = require("./personOfDayService");

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

module.exports = { skip, hardDay };
