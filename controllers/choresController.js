const {
  updatePoints,
  completeChores,
  runMidnight,
  runHourlyUpdate,
} = require("../services/choreService");
const { fileWriter } = require("../services/fileWriter");
const { generateChoresJson } = require("../services/choreGeneratorService");
const { getOldJson } = require("../services/getOldJson");

function completeChore(req, res, next) {
  try {
    const state = getOldJson();
    const updatedState = completeChores(state, req.body);
    fileWriter(updatedState);
    res.status(200).json({ sucess: true });
  } catch (err) {
    next(err);
  }
}

function scoreUpdate(req, res, next) {
  try {
    const state = getOldJson();
    const updatedState = updatePoints(state, req.body);

    fileWriter(updatedState);
    fileLogger(`${payload.kid} ${payload.point}`);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

function resetMidnight(req, res, next) {
  try {
    const state = getOldJson();
    const updatedState = runMidnight(state);
    fileWriter(updatedState);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

function resetHourly(req, res, next) {
  try {
    const state = getOldJson();
    const updatedState = runHourlyUpdate(state);
    fileWriter(updatedState);
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
  completeChore,
  regenerateChores,
  resetHourly,
  resetMidnight,
  scoreUpdate,
};
