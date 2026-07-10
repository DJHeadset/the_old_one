const {
  updatePoints,
  completeChores,
  runMidnight,
  runHourlyUpdate,
  calculateStars,
  calculateTitle,
} = require("../services/choreService");
const { fileWriter } = require("../services/fileWriter");
const { generateChoresJson } = require("../services/choreGeneratorService");
const { getOldJson } = require("../services/getOldJson");
const XLSX = require("xlsx");

function serveChore(req, res, next) {
  //console.log("serve")
  try {
    const state = getOldJson("chores.json");
    res.status(200).json(state);
  } catch (err) {
    next(err);
  }
}

function completeChore(req, res, next) {
  try {
    const state = getOldJson("chores.json");
    const updatedState = completeChores(state, req.body);
    fileWriter("chores", updatedState);
    res.status(200).json({ sucess: true });
  } catch (err) {
    next(err);
  }
}

function extraChoreComplete(req, res, next) {
  try {
    const { kid, task } = req.body;

    console.log("Extra chore:", kid, task);

    const wb = XLSX.readFile("/app/excel/NapirendTest.xlsx");
    const skillDefinitions = getOldJson("tasks.json");

    if (!kid || !task) {
      return res.status(400).json({
        error: "Missing kid or task",
      });
    }

    const state = getOldJson("chores.json");

    if (!state[kid]) {
      return res.status(404).json({
        error: "Kid not found",
      });
    }

    // Add XP to the task
    if (!state[kid].skills) {
      state[kid].skills = {};
    }

    if (!state[kid].skills[task]) {
      state[kid].skills[task] = {
        xp: 0,
        level: 1,
      };
    }

    const skill = state[kid].skills.find((s) => s.name === task);

    if (!skill) {
      return res.status(404).json({
        error: "Skill not found",
      });
    }

    skill.xp += 1;

    skill.stars = calculateStars(skill.xp);

    // You need the skillDefinitions here
    const titles = skillDefinitions.skills[task];
    skill.title = calculateTitle(skill.stars, titles);

    const goldReward = Math.max(1, skill.stars) * 5;
    state[kid].gold += goldReward;

    fileWriter("chores", state);

    res.json(state[kid]);
  } catch (err) {
    next(err);
  }
}

function scoreUpdate(req, res, next) {
  try {
    const state = getOldJson("chores.json");
    const updatedState = updatePoints(state, req.body);
    fileWriter("chores", updatedState);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

function resetMidnight(req, res, next) {
  try {
    const state = getOldJson("chores.json");
    const updatedState = runMidnight(state);
    fileWriter("chores", updatedState);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

function resetHourly(req, res, next) {
  try {
    const state = getOldJson("chores.json");
    const updatedState = runHourlyUpdate(state);
    fileWriter("chores", updatedState);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

function regenerateChores(req, res, next) {
  try {
    generateChoresJson();
    res.status(200).json({ sucess: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  serveChore,
  completeChore,
  extraChoreComplete,
  regenerateChores,
  resetHourly,
  resetMidnight,
  scoreUpdate,
};
