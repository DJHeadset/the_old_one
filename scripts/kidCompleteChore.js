const { consoleLogger } = require("../services/consoleLogger")
const { fileWriter } = require("../sevices/fileWriter")
const { getOldJson } = require("../sevices/getOldJson")

exports.kidCompleteChore = (payload) => {
  consoleLogger(`${payload.kid} + " Completed chore #" + ${payload.index} + " Pushed " + ${payload.pushed}`)

  const oldJson = getOldJson()
  let newJson = oldJson

  if (payload.kid === "Anya") {
    newJson["Anya"].chores.splice(payload.index, 1)
  } else {
    payload.pushed === "Kid" 
    ?
    newJson[payload.kid].chores[payload.index].kid = true
    :
    newJson[payload.kid].chores[payload.index].adult = true;
  }

  fileWriter(newJson)
}