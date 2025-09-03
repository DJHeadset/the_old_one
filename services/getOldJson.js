const fs = require('fs');
const { consoleLogger } = require('../services/consoleLogger');

const outputPath = `//192.168.0.150/config/www/chores.json`;

exports.getOldJson = () => {
  consoleLogger("Getting old JSON")

    let oldJson = {}
    try {
      if (fs.existsSync(outputPath)) {
        oldJson = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
      }
    } catch (error) {
      console.error("Could not load previous chores.json:", error.message)
    }
  return oldJson
}