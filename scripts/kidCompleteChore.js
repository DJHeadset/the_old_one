const { fileWriter } = require("../sevices/fileWriter")
const { getOldJson } = require("../sevices/getOldJson")

exports.kidCompleteChore = (payload) => {
  console.log(payload.kid + " Completed chore #:" + payload.index + " Pushed" + payload.pushed)

  const oldJson = getOldJson()
  let newJson = oldJson
  payload.pushed === "Kid" ? newJson[payload.kid].chores[payload.index].kid = true : newJson[payload.kid].chores[payload.index].adult = true;

  fileWriter(newJson)
}