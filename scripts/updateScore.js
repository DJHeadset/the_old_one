const { consoleLogger } = require("../services/consoleLogger")
const { fileLogger } = require("../services/fileLogger")
const { fileWriter } = require("../services/fileWriter")
const { getOldJson } = require("../services/getOldJson")
const { percentCalculator } = require("../services/percentCalculator")


exports.updateHourly = () => {
  consoleLogger(`score updated`)

  const oldJson = getOldJson()
  let newJson = { ...oldJson }
  Object.keys(oldJson).forEach(kid => {
    let chores = newJson[kid].chores || []
    const availablePoints = chores.length + newJson[kid].availableScore
    const actualPoints = (chores.filter(chore => chore.adult === true).length || 0) + newJson[kid].actualScore
    let percent = newJson[kid].percent
    if (availablePoints > 0) {
      percent = Math.floor((actualPoints / availablePoints) * 100)
    }
    newJson[kid].availableScore = availablePoints
    newJson[kid].actualScore = actualPoints
    newJson[kid].percent = percentCalculator(newJson[kid])

    const failedChores = chores.filter(chore => chore.adult === false);
    if (failedChores.length > 0) {
      const names = failedChores.map(c => c.name).join(", ");
      const message = `${kid} failed chores: ${names}`;
      fileLogger(message);
    }
  })
  fileWriter(newJson)
}

exports.updateScore = (payload) => {
  const oldJson = getOldJson()
  let newJson = { ...oldJson }
  newJson[payload.kid].actualScore += payload.point
  fileLogger(`${payload.kid} ${payload.point}`)
  newJson[payload.kid].percent = percentCalculator(newJson[payload.kid])
  fileWriter(newJson)
}

exports.updateMidnight = () => {
  consoleLogger("Midnight reset running...");
  const oldJson = getOldJson()
  let newJson = { ...oldJson }

  Object.keys(newJson).forEach(kid => {
    let child = newJson[kid]
    if (child.percent >= 75) {
      child.score++
    } else {
      if (child.score <= 0) {
        child.score--
      } else if (child.score <= 7) {
        child.score = 0
      } else {
        child.score -= 7
      }
    }
    child.availableScore = 0
    child.actualScore = 0
    child.percent = 0
  })
  fileWriter(newJson)
}