function choosePersonOfDay(pod) {
  const children = ["Zolika", "Manó", "Bogi"];

  const start = new Date("2025-04-26");
  const today = new Date();

  const days = Math.floor((today - start) / 86400000);

  const kid = children[days % children.length];

  pod.dadLast = (pod.dadLast ?? 0) + 1;
  pod.momLast = (pod.momLast ?? 0) + 1;

  const random = Math.floor(Math.random() * 100);

  if (random < pod.dadLast) {
    pod.tomorrow = "Apa";
  } else if (random < pod.dadLast + pod.momLast) {
    pod.tomorrow = "Anya";
  } else {
    pod.tomorrow = kid;
  }

  return pod;
}

function updatePersonOfDay() {
  const { getOldJson } = require("./getOldJson");
  const { fileWriter } = require("./fileWriter");

  const pod = getOldJson("tasks.json");

  pod.today = pod.tomorrow ?? "";

  if (pod.today === "Apa") {
    pod.dadLast = 0;
  } else if (pod.today === "Anya") {
    pod.momLast = 0;
  }

  const updated = choosePersonOfDay(pod);

  fileWriter("tasks", updated);

  return updated;
}

module.exports = {
  choosePersonOfDay,
  updatePersonOfDay,
};
