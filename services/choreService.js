const { fileLogger } = require("./fileLogger");
const { percentCalculator } = require("./percentCalculator");

function completeChores(state, payload) {
  const newState = structuredClone(state);

  if (payload.kid === "Anya") {
    newState["Anya"].chores.splice(payload.index, 1);
  } else {
    if (payload.pushed === "Kid") {
      newState[payload.kid].chores[payload.index].kid = true;
    } else {
      newState[payload.kid].chores[payload.index].adult = true;
      newState[payload.kid].percent = percentCalculator(newState[payload.kid]);
    }
  }

  return newState;
}

function updatePoints(state, payload) {
  const newState = structuredClone(state);
  newState[payload.kid].actualScore += payload.point;
  newState[payload.kid].percent = percentCalculator(newState[payload.kid]);
  fileLogger(`${payload.kid} ${payload.point}`);
  return newState;
}

function runMidnight(state) {
  const today = new Date().toISOString().split("T")[0];
  const newState = structuredClone(state);

  if (!newState._meta) {
    newState._meta = {};
  }

  if (newState._meta.lastMidnightRun === today) {
    return newState; // already executed
  }

  Object.keys(newState).forEach((key) => {
    if (key === "_meta") return;
    const child = newState[key];
    if (!child || typeof child !== "object") return;

    if (child.percent > 100) {
      child.score += 2;
      child.gold += 20;
    } else if (child.percent >= 75) {
      child.score++;
      child.gold += 10;
    } else {
      if (child.score <= 0) {
        child.score--;
      } else if (child.score <= 7) {
        child.score = 0;
      } else {
        child.score -= 7;
      }
    }
    child.availableScore = 0;
    child.actualScore = 0;
    child.percent = 0;
    child.warnings = 0;
  });
  newState._meta.lastMidnightRun = today;

  return newState;
}

function runHourlyUpdate(state) {
  const newState = structuredClone(state);

  Object.keys(newState).forEach((key) => {
    if (key === "_meta") return;

    const child = newState[key];
    if (!child || typeof child !== "object") return;

    let chores = child.chores || [];
    const availableThisHour = chores.length;
    const approvedThisHour = chores.filter(
      (chore) => chore.adult === true,
    ).length;

    child.availableScore += availableThisHour;
    child.actualScore += approvedThisHour;

    const failedChores = chores.filter((chore) => chore.adult === false);
    if (failedChores.length > 0) {
      const names = failedChores.map((c) => c.name).join(", ");
      const message = `${child} failed chores: ${names}`;
      fileLogger(message);
    }
    child.chores = [];
    child.percent = percentCalculator(child);
  });
  return newState;
}

function calculateStars(xp) {
  return Math.min(Math.floor(xp / 5), 3);
}

function calculateTitle(stars, titles) {
  if (!titles || stars <= 0) return "";
  return titles[stars] || "";
}

function buildSkills(oldState, kidName, skillDefinitions) {
  const oldSkills = oldState[kidName]?.skills || [];

  return Object.keys(skillDefinitions).map((skillName) => {
    const titles = skillDefinitions[skillName];

    const existing = oldSkills.find((s) => s.name === skillName);

    const xp = existing?.xp ?? 0;
    const stars = calculateStars(xp);
    const title = calculateTitle(stars, titles);

    return {
      name: skillName,
      xp,
      stars,
      title,
    };
  });
}
module.exports = {
  completeChores,
  updatePoints,
  runMidnight,
  runHourlyUpdate,
  calculateStars,
  calculateTitle,
  buildSkills,
};
