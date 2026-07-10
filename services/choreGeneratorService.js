const XLSX = require("xlsx");
const { getOldJson } = require("./getOldJson");
const { fileWriter } = require("./fileWriter");
const { calculateStars, calculateTitle } = require("./choreService");

function buildImageMap(workbook) {
  const imageMap = {};
  if (!workbook.SheetNames.includes("Képek")) return imageMap;

  const mapSheet = workbook.Sheets["Képek"];
  const rows = XLSX.utils.sheet_to_json(mapSheet, {
    header: ["chore", "image"],
  });

  rows.forEach((row) => {
    if (!row.chore || !row.image) return;

    const chore = row.chore.trim();
    const rawImage = row.image.trim();
    const parts = rawImage.split("\\");
    const wwwIndex = parts.findIndex((p) => p.toLowerCase() === "www");

    if (wwwIndex >= 0) {
      const relativeParts = parts.slice(wwwIndex + 1);
      imageMap[chore] = "/local/" + relativeParts.join("/");
    }
  });
  return imageMap;
}

function buildSkillDefinitions(workbook) {
  const skillDefinitions = {};

  if (!workbook.SheetNames.includes("Feladat")) {
    return skillDefinitions;
  }

  const sheet = workbook.Sheets["Feladat"];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  for (let i = 1; i < rows.length; i++) {
    const skillName = String(rows[i][0] || "").trim();
    //console.log("SKill " + skillName)

    if (!skillName) continue;

    skillDefinitions[skillName] = {
      1: String(rows[i][1] || "").trim(),
      2: String(rows[i][2] || "").trim(),
      3: String(rows[i][3] || "").trim(),
    };
  }

  return skillDefinitions;
}

function buildSkills(oldState, kidName, skillDefinitions) {
  //console.log("buildSkills");
  const oldSkills = oldState[kidName]?.skills || [];

  return Object.keys(skillDefinitions).map((skillName) => {
    const titles = skillDefinitions[skillName];

    const existing = oldSkills.find((s) => s.name === skillName);

    const xp = existing?.xp ?? 0;
    const stars = calculateStars(xp);
    const title = calculateTitle(stars, titles);

    return {
      name: skillName,
      xp,
      stars,
      title,
    };
  });
}

function extractChoresForHour(data, sheetName, currentHour, imageMap) {
  const headers = data[0];

  const hourColIndex = headers.findIndex((h) => {
    const hr = parseInt(String(h).split(":")[0], 10);
    return !isNaN(hr) && hr === currentHour;
  });

  const chores = [];

  for (let i = 1; i < data.length; i++) {
    const choreName = String(data[i][hourColIndex] || "").trim();

    if (choreName) {
      chores.push({
        name: choreName,
        kid: sheetName === "Anya",
        adult: false,
        image: imageMap[choreName] || "",
      });
    }
  }
  return chores;
}

function buildAnyaState(oldState, newChores) {
  const oldChores = oldState["Anya"]?.chores || [];
  const oldNames = oldChores.map((c) => c.name);
  let merged = [...oldChores];

  newChores.forEach((chore) => {
    if (!oldNames.includes(chore.name)) {
      merged.push(chore);
    }
  });
  return {
    ...oldState["Anya"],
    score: oldState["Anya"]?.score ?? 0,
    chores: merged,
  };
}

function buildKidState(oldState, kidName, chores, skillDefinitions) {
  //console.log("buildKidState");
  //console.log(chores);
  const skills = buildSkills(oldState, kidName, skillDefinitions);
  return {
    score: oldState[kidName]?.score ?? 0,
    availableScore: oldState[kidName]?.availableScore ?? 0,
    actualScore: oldState[kidName]?.actualScore ?? 0,
    percent: oldState[kidName]?.percent ?? 0,
    activeTitle: oldState[kidName]?.activeTitle ?? "",
    gold: oldState[kidName]?.gold ?? 0,
    chores: chores,
    skills: skills,
  };
}

exports.generateChoresJson = () => {
  //console.log("reading excel");
  const excelPath = "/app/excel/NapirendTest.xlsx";
  const now = new Date();
  const currentHour = now.getHours();
  const wb = XLSX.readFile(excelPath);
  const sheets = wb.SheetNames;
  const oldState = getOldJson("chores.json");
  const imageMap = buildImageMap(wb);
  const skillDefinitions = buildSkillDefinitions(wb);
  const result = {};

  sheets.forEach((sheetName) => {
    //console.log(sheetName)
    if (sheetName === "Képek" || sheetName === "Feladat") return;
    const sheet = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (data.length < 2) return;

    const choresForHour = extractChoresForHour(
      data,
      sheetName,
      currentHour,
      imageMap,
    );
    //console.log(choresForHour)

    if (sheetName === "Anya") {
      result[sheetName] = buildAnyaState(oldState, choresForHour);
    } else {
      result[sheetName] = buildKidState(
        oldState,
        sheetName,
        choresForHour,
        skillDefinitions,
      );
    }
  });
  fileWriter("chores", result);
  fileWriter("tasks", {
    skills: skillDefinitions,
  });
};
