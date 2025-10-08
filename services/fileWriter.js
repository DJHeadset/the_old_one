const fs = require('fs');
const { consoleLogger } = require('./consoleLogger');
const path = require('path');

exports.fileWriter = (result) => {
  consoleLogger("Writing JSON file")
  const outputPath = path.join('/app/www', 'chores.json');

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  consoleLogger(`Chores JSON updated:, ${Object.keys(result)}`);
}