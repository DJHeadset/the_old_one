const { consoleLogger } = require("../services/consoleLogger");
const { skip, hardDay } = require("../services/miscService");

function personChange(req, res, next) {
  const { person, reason } = req.body;
  if (person !== "Anya" && person !== "Apa") {
    consoleLogger("Invalid person");
    return res.status(400).json({ error: "Invalid person" });
  } else {
    if (reason === "skip") {
      skip(person);
    } else if (reason === "hard_day") {
      hardDay(person);
    } else {
      consoleLogger("Invalid reason");
    }
  }

  res.status(200).json({ person, reason });
}

module.exports = {
  personChange,
};
