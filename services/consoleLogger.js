

exports.consoleLogger = (message) => {
  const timeStamp = new Date().toLocaleString("hu-HU")
  const logEntry = `[${timeStamp}] ${message}`
  console.log(logEntry)
}