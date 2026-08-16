function choosePersonOfDay(pod) {
  const children = ["Zolika", "Manó", "Bogi"];
  const start = Date.UTC(2025, 3, 27);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((today - start) / 86400000);
  const kid = children[days % children.length];
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

  pod.dadLast = (pod.dadLast ?? 0) + 1;
  pod.momLast = (pod.momLast ?? 0) + 1;

  const updated = choosePersonOfDay(pod);

  fileWriter("tasks", updated);

  return updated;
}

module.exports = {
  choosePersonOfDay,
  updatePersonOfDay,
};
