const { consoleLogger } = require("../services/consoleLogger")
const { fileLogger } = require("../services/fileLogger")
const { fileWriter } = require("../sevices/fileWriter")
const { getOldJson } = require("../sevices/getOldJson")


exports.updateHourly = (payload) => {
  consoleLogger(`score updated + ${payload}`)

  const oldJson = getOldJson()
  let newJson = { ...oldJson }
  Object.keys(oldJson).forEach(kid => {
    let chores = newJson[kid].chores || []
    const availablePoints = chores.length ? 1 : 0
    const actualPoints = (chores.filter(chore => chore.adult === true).length || 0) / (chores.length || 0)
    console.log(availablePoints + " " + actualPoints)
    let percent = newJson[kid].percent
    if (availablePoints > 0) {
      percent = Math.floor((actualPoints / availablePoints) * 100)
    }
    newJson[kid].availableScore += availablePoints
    newJson[kid].actualScore += actualPoints
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