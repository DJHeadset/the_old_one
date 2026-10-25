const { get } = require("../routes/jellyfinRoute");
const { consoleLogger } = require("../services/consoleLogger");
const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");

function itemAdded(req, res, next) {
  const MAX_AGE_DAYS = 30;
  const MAX_ITEMS = 500;
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

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

    const recentEvents = events.filter((entry) => {
      const timestamp = Date.parse(entry.receivedAt);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });

    const updatedEvents = [
      record,
      ...recentEvents.filter(
        (entry) => String(entry.itemId) !== String(itemId),
      ),
    ]
      .sort((a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt))
      .slice(0, MAX_ITEMS);

    const duplicate = events.some(
      (entry) => String(entry.itemId) === String(itemId),
    );

    fileWriter("jellyfin_events", updatedEvents);
    consoleLogger(
      `[Jellyfin] ${duplicate ? "Updated" : "New media"}: ${record.name}`,
    );

    return res.status(duplicate ? 200 : 201).json({
      accepted: true,
      duplicate,
      itemId,
      retainedEvents: updatedEvents.length,
    });
  } catch (error) {
    console.error("[Jellyfin] Failed to record event:", error);
    return res.status(500).json({ error: "Failed to save event" });
  }
}

function getJellyfin (req, res, next) {
  try {
    const state = getOldJson("jellyfin_events.json")
    res.status(200).json(state)
  } catch (error) {
    console.error("[Jellyfin] Failed to get file:", error);
    return res.status(500).json({ error: "Failed to get events" });
  }
}

module.exports = {
  itemAdded,
  getJellyfin,
};
