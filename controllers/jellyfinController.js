const { consoleLogger } = require("../services/consoleLogger");
const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");

function itemAdded(req, res, next) {
  try {
    const event =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    console.log("[Jellyfin] Incoming payload:", JSON.stringify(event, null, 2));

    const item = event.Item || event;
    const itemId = item.ItemId || item.Id || event.ItemId || event.Id;

    if (!itemId) {
      return res.status(400).json({ error: "Missing item ID" });
    }

    const oldJson = getOldJson("jellyfin_events.json");
    const events = Array.isArray(oldJson) ? oldJson : [];

    if (events.some((entry) => String(entry.itemId) === String(itemId))) {
      return res.status(200).json({
        accepted: true,
        duplicate: true,
        itemId,
      });
    }

    const record = {
      itemId: String(itemId),
      name: item.Name || "Unknown media",
      itemType: item.ItemType || "Unknown",
      seriesName: item.SeriesName || null,
      seasonNumber: item.SeasonNumber ?? null,
      episodeNumber: item.EpisodeNumber ?? null,
      year: item.Year ?? null,
      receivedAt: new Date().toISOString(),
    };

    events.push(record);
    fileWriter("jellyfin_events", events);
    consoleLogger(`[Jellyfin] New media: ${record.name}`);

    return res.status(201).json({
      accepted: true,
      duplicate: false,
      itemId,
    });
  } catch (error) {
    console.error("[Jellyfin] Failed to record event:", error);
    return res.status(500).json({ error: "Failed to save event" });
  }
}

module.exports = {
  itemAdded,
};
