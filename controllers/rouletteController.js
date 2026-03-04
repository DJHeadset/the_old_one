const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");

function yesterdaysChoices(req, res, next) {
  try {
    const oldOptions = getOldJson("breakfast.json");
    res.status(200).json(oldOptions);
  } catch (err) {
    next(err);
  }
}

function todaysWinner(req, res, next) {
  try {
    const choices = req.body.options;
    const lastWinner = req.body.lastWinner;

    const eligibleOptions = choices.filter((option) => option !== lastWinner);

    const random = Math.floor(Math.random() * eligibleOptions.length);
    const winner = eligibleOptions[random];

    const newState = {
      options: choices,
      lastWinner: winner,
    };

    fileWriter("breakfast", newState);

    res.status(200).json({ winner });
  } catch (err) {
    next(err);
  }
}

module.exports = { yesterdaysChoices, todaysWinner };
