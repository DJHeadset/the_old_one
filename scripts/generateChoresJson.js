const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

exports.generateChoresJson = () => {
  console.log("generateChoresJson")

  const excelPath = `D:\\NapirendTest.xlsx`;
  const outputPath = `//192.168.0.150/config/www/chores.json`;
  const now = new Date();
  const currentHour = now.getHours();
  const wb = XLSX.readFile(excelPath);
  const sheets = wb.SheetNames;
  const imageMap = {};
  const result = {};

  let oldJson = {}
  try {
    if (fs.existsSync(outputPath)) {
      oldJson = JSON.parse(fs.readFileSync(outputPath, 'utf8'))
    }
  } catch (error) {
    console.error("Could not load previous chores.json:", err.message)
  }

  if (sheets.includes('Képek')) {
    const mapSheet = wb.Sheets['Képek'];
    const rows = XLSX.utils.sheet_to_json(mapSheet, { header: ['chore', 'image'] });

    rows.forEach(row => {
      if (row.chore && row.image) {
        const chore = row.chore.trim();
        const rawImage = row.image.trim();

        const parts = rawImage.split('\\');
        const wwwIndex = parts.findIndex(p => p.toLowerCase() === 'www');

        if (wwwIndex >= 0) {
          const relativeParts = parts.slice(wwwIndex + 1);
          const image = '/local/' + relativeParts.join('/');
          imageMap[chore] = image;
        }
      }
    });
  }

  let noChores = true
  sheets.forEach(sheetName => {
    if (sheetName === 'Képek') return;
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (data.length < 2) return;


    const headers = data[0];
    let hourColIndex = headers.findIndex(h => {
      const hr = parseInt(String(h).split(':')[0], 10);
      return !isNaN(hr) && hr === currentHour;
    });
    if (hourColIndex < 0) return;

    const chores = [];
    for (let r = 1; r < data.length; r++) {
      const choreName = String(data[r][hourColIndex] || '').trim();
      if (choreName) {
        noChores = false
        chores.push({
          name: choreName,
          kid: false,
          adult: false,
          image: imageMap[choreName] || ''
        });
      }
    }

    
      result[sheetName] = {
        score: oldJson[sheetName]?.score ?? 0,
        chores,
      };
  });

  if (noChores) {
    result.message = `no chores at hour ${currentHour}`;
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('Chores JSON updated:', Object.keys(result));
}
