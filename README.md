🧹 Chores Automation API

This project automates chores tracking for kids (and adults) using Excel as the input source and Home Assistant as the frontend.
It reads an Excel file with chores, maps them to images, writes the data into a JSON file (chores.json), and exposes a small Express API for updating and completing chores.

The JSON file is saved into Home Assistant's www folder, making it accessible for dashboards and automations.

✨ Features

📖 Excel-driven chores – read tasks from an .xlsx file (NapirendTest.xlsx).

🖼️ Image mapping – map chores to images via the Képek sheet.

⏰ Hourly filtering – only show chores for the current hour.

✅ Completion tracking – mark chores as completed by kid or adult.

📊 Score persistence – keeps scores from the previous JSON file.

🌐 Express API – endpoints for updating chores and marking them complete.

🔄 Home Assistant integration – JSON stored in /config/www/chores.json.

📂 Project Structure
.
├── scripts/
│   ├── generateChoresJson.js   # Generates chores.json from Excel
│   ├── kidCompleteChore.js     # Marks chores as completed
├── services/
│   ├── fileWriter.js           # Writes chores.json to HA config
│   └── getOldJson.js           # Reads old chores.json
├── server.js                   # Express server with API endpoints
└── README.md                   # You are here

⚙️ Requirements

Node.js
 (>= 14 recommended)

npm or yarn

An accessible Excel file with chores (see below for structure)

Home Assistant running with access to /config/www/

📑 Excel File Format

Each sheet (except Képek) represents a person (e.g., Zolika, Anya, Apa).

The first row contains hours (e.g., 8:00, 9:00, …).

Each row under an hour contains a chore name.

The Képek sheet maps chores to image paths.

Example

Sheet: Zolika

Hour	8:00	9:00
1	Brush	Homework
2	Get Dressed	Playtime

Sheet: Képek

chore	image
Brush	\www\images\brush.png
Homework	\www\images\homework.png
Get Dressed	\www\images\getdressed.png
🚀 Usage
1. Install dependencies
npm install

2. Configure Excel path

In generateChoresJson.js, update the path:

const excelPath = "D:\\NapirendTest.xlsx";

3. Start the server
node server.js


Server runs on http://localhost:5000
.

🔌 API Endpoints
Update chores JSON
POST /update_chore


Generates a new chores.json file from Excel.

Response:

{ "message": "Chore JSON updated successfully" }

Mark chore complete
POST /complete_chore
Content-Type: application/json

{
  "kid": "Zolika",
  "index": 0,
  "pushed": "Kid"
}


kid → name of the sheet/person.

index → position of chore in the current list.

pushed → "Kid" or "Adult".

🏠 Home Assistant Integration

The JSON is written to:

/config/www/chores.json


You can access it via:

http://<home_assistant_ip>:8123/local/chores.json


Use Lovelace dashboards or automations to display chores, mark completion, and trigger rewards (e.g., TTS announcements).

📌 Notes

If no chores exist for the current hour, the JSON will include:

{ "message": "no chores at hour 14" }


Scores persist between updates by reading from the old chores.json.

📜 License

MIT – free to use, modify, and share.