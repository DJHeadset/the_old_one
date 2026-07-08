const {
  updatePoints,
  completeChores,
  runMidnight,
  runHourlyUpdate,
} = require("../services/choreService");
const { fileWriter } = require("../services/fileWriter");
const { generateChoresJson } = require("../services/choreGeneratorService");
const { getOldJson } = require("../services/getOldJson");

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
  console.log(req.body);
  res.status(200).json(req.body);
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
