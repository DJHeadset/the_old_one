const fs = require('fs');
const { consoleLogger } = require('../services/consoleLogger');
const path = require('path');


const outputPath = path.join('/app/www', 'chores.json');

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