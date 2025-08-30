const fs = require('fs');
const { consoleLogger } = require('../services/consoleLogger');
const { fileLogger } = require('../services/fileLogger');

exports.fileWriter = (result) => {
  consoleLogger("Writing JSON file")
  fileLogger("Writing JSON file")
  const outputPath = `//192.168.0.150/config/www/chores.json`;

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  consoleLogger(`Chores JSON updated:, ${Object.keys(result)}`);
}