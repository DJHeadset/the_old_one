const fs = require('fs');

exports.fileWriter = (result) => {
  console.log("Writing JSON file")
  const outputPath = `//192.168.0.150/config/www/chores.json`;

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('Chores JSON updated:', Object.keys(result));
}