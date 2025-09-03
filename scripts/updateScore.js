const { consoleLogger } = require("../services/consoleLogger")
const { fileLogger } = require("../services/fileLogger")
const { fileWriter } = require("../services/fileWriter")
const { getOldJson } = require("../services/getOldJson")


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
    newJson[kid].percent = percent

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
  fileWriter(newJson)
}