const { fileWriter } = require("./fileWriter");
const { getOldJson } = require("./getOldJson");

const API_URL = "https://www.googleapis.com/youtube/v3/videos";

const REGIONS = ["US", "GB", "HU"];
const MAX_RESULTS_PER_REGION = 50;
const TOP_LIMIT = 10;

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "you",
  "your",
  "are",
  "was",
  "has",
  "have",
  "how",
  "what",
  "when",
  "why",
  "who",
  "not",
  "but",
  "all",
  "new",
  "official",
  "video",
  "videos",
  "episode",
  "part",
  "full",
  "live",
  "shorts",
  "youtube",
]);

async function fetchPopularVideos(region) {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    key,
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: region,
    maxResults: String(MAX_RESULTS_PER_REGION),
  });

  const response = await fetch(`${API_URL}?${params}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `YouTube API failed for ${region}: ${response.status} ${details}`,
    );
  }

  const result = await response.json();
  return result.items ?? [];
}

function addScore(scores, label, region, views, type) {
  const key = label.toLowerCase();

  if (!scores.has(key)) {
    scores.set(key, {
      label,
      type,
      score: 0,
      regions: new Set(),
      mentions: 0,
    });
  }

  const item = scores.get(key);
  item.score += 1 + Math.log10(1 + views) / 3;
  item.regions.add(region);
  item.mentions += 1;
}

function extractHashtags(text) {
  return [
    ...new Set(
      (text.match(/#[\p{L}\p{N}_]+/gu) ?? [])
        .map((tag) => tag.toLowerCase())
        .filter((tag) => tag.length > 2 && tag.length <= 45),
    ),
  ];
}

function rankHashtags(regionalResults) {
  const scores = new Map();

  for (const { region, videos } of regionalResults) {
    for (const video of videos) {
      const snippet = video.snippet ?? {};
      const text = `${snippet.title ?? ""} ${snippet.description ?? ""}`;
      const hashtags = extractHashtags(text);
      const views = Number(video.statistics?.viewCount ?? 0);

      // Each hashtag gets at most one vote per video.
      for (const hashtag of hashtags) {
        if (!scores.has(hashtag)) {
          scores.set(hashtag, {
            hashtag,
            score: 0,
            videoIds: new Set(),
            regions: new Set(),
          });
        }

        const item = scores.get(hashtag);

        // Avoid counting the same video twice.
        if (!item.videoIds.has(video.id)) {
          item.videoIds.add(video.id);
          item.score += 1 + Math.log10(1 + views) / 10;
        }

        item.regions.add(region);
      }
    }
  }

  return [...scores.values()]
    .map((item) => ({
      hashtag: item.hashtag,
      videoCount: item.videoIds.size,
      regionCount: item.regions.size,
      regions: [...item.regions],
      score: Number(item.score.toFixed(2)),
      // Reward hashtags appearing across multiple regions.
      finalScore: Number(
        (item.score * (1 + 0.5 * (item.regions.size - 1))).toFixed(2),
      ),
    }))
    .sort(
      (a, b) =>
        b.finalScore - a.finalScore ||
        b.regionCount - a.regionCount ||
        b.videoCount - a.videoCount,
    );
}

async function CheckCurrentThings() {
  console.log("Starting worldwide YouTube trend scan");

  // Keep the previous snapshot if the scan fails.
  const previous = getOldJson("current_thing.json");

  try {
    const results = await Promise.allSettled(
      REGIONS.map((region) => fetchPopularVideos(region)),
    );

    const scores = new Map();
    let successfulRegions = 0;

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") {
        console.error(
          `Trend scan failed for ${REGIONS[index]}:`,
          result.reason.message,
        );
        return;
      }

      successfulRegions++;
      const region = REGIONS[index];

      for (const video of result.value) {
        const snippet = video.snippet ?? {};
        const views = Number(video.statistics?.viewCount ?? 0);
        const text = `${snippet.title ?? ""} ${snippet.description ?? ""}`;

        for (const tag of extractHashtags(text)) {
          addScore(scores, tag, region, views, "hashtag");
        }
      }
    });

    if (successfulRegions === 0) {
      throw new Error("All regional YouTube requests failed");
    }

    const regionalResults = results.flatMap((result, index) =>
      result.status === "fulfilled"
        ? [{ region: REGIONS[index], videos: result.value }]
        : [],
    );

    if (regionalResults.length === 0) {
      throw new Error("All regional YouTube requests failed");
    }

    const ranked = rankHashtags(regionalResults);
    const currentThings = ranked.slice(0, 10).map((item) => item.hashtag);
    if (currentThings.length === 0) {
      throw new Error("No trends could be extracted");
    }

    const topTen = ranked.slice(0, 10);

    const output = {
      updated_at: new Date().toISOString(),
      source: "YouTube regional mostPopular charts",
      regions_checked: regionalResults.length,

      // Keep this array for your existing frontend.
      current_things: topTen.map((item) => item.hashtag),

      // Extra diagnostic information for debugging and future improvements.
      hashtag_details: topTen,
    };

    fileWriter("current_thing", output);

    console.log(
      `Trend scan complete: ${currentThings.length} trends from ${successfulRegions} regions`,
    );

    return output;
  } catch (error) {
    console.error("Worldwide trend scan failed:", error.message);

    // Don't overwrite a previously successful snapshot.
    if (previous?.current_things?.length) {
      return previous;
    }

    throw error;
  }
}

function getCurrentThings() {
  return getOldJson("current_thing.json");
}

module.exports = {
  CheckCurrentThings,
  getCurrentThings,
};
