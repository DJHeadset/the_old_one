const { consoleLogger } = require("../services/consoleLogger")
const { fileWriter } = require("../sevices/fileWriter")
const { getOldJson } = require("../sevices/getOldJson")


exports.updateScore = (payload) => {
  consoleLogger(`score updated + ${payload}`)

  const oldJson = getOldJson()
  let newJson = oldJson
  //let score = oldJson

  if(payload.kid !== "None"){
    newJson[payload.kid].score += payload.point
  }

  fileWriter(newJson)
}