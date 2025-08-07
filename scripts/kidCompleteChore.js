const { fileWriter } = require("../sevices/fileWriter")
const { getOldJson } = require("../sevices/getOldJson")

exports.kidCompleteChore = (payload) => {
  console.log(payload.kid + " Completed chore #:" + payload.index)

  const oldJson = getOldJson()
  let newJson = oldJson
  newJson[payload.kid].chores[payload.index].kid = true;

  fileWriter(newJson)
}