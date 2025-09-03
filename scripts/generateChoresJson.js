const XLSX = require('xlsx');
const { getOldJson } = require('../services/getOldJson');
const { fileWriter } = require('../services/fileWriter');

exports.generateChoresJson = () => {
  const excelPath = `D:\\NapirendTest.xlsx`;
  const now = new Date();
  const currentHour = now.getHours();
  const wb = XLSX.readFile(excelPath);
  const sheets = wb.SheetNames;
  const imageMap = {};
  const result = {};

  const oldJson = getOldJson()

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

    const chores = [];
    for (let i = 1; i < data.length; i++) {
      const choreName = String(data[i][hourColIndex] || '').trim();
      if (choreName) {
        noChores = false
        chores.push({
          name: choreName,
          kid: sheetName === "Anya",
          adult: false,
          image: imageMap[choreName] || ''
        });
      }
    }

    if (sheetName === 'Anya') {
      const oldChores = oldJson["Anya"]?.chores || []
      const oldNames = oldChores.map(c => c.name)
      let merged = [...oldChores]

      chores.forEach(c => {
        if (!oldNames.includes(c.name)) {
          merged.push(c)
        }
      })

      result[sheetName] = {
        score: 0,
        chores: merged
      }
    } else {
      result[sheetName] = {
        score: oldJson[sheetName]?.score ?? 0,
        availableScore: oldJson[sheetName]?.availableScore ?? 0,
        actualScore: oldJson[sheetName]?.actualScore ?? 0,
        percent: oldJson[sheetName]?.percent ?? 0,
        chores,
      };
    }
  });

  if (noChores) {
    result.message = `no chores at hour ${currentHour}`;
  }
  fileWriter(result)
}
