const { fileWriter } = require("./fileWriter");
const { getOldJson } = require("./getOldJson");

const key = process.env.YOUTUBE_API_KEY;

const WATCHLIST_FILE = "youtube-watchlist.json";
const MAX_RESULTS = 50;

async function youtubeRequest(endpoint, params) {
  if (!key) {
    throw new Error("YOUTUBE_API_KEY is missing");
  }

  const query = new URLSearchParams({
    ...params,
    key,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${endpoint}?${query}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `YouTube API error: ${data.error?.message || response.statusText}`,
    );
  }

  return data;
}

async function getUploadsPlaylist(handle) {
  const data = await youtubeRequest("channels", {
    part: "contentDetails",
    forHandle: handle.replace(/^@/, ""),
  });

  if (!data.items?.length) {
    throw new Error(`Could not find YouTube channel: ${handle}`);
  }

  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getChannelThumbnail(handle) {
  const data = await youtubeRequest("channels", {
    part: "snippet",
    forHandle: handle.replace(/^@/, ""),
  });

  const thumbnails = data.items?.[0]?.snippet?.thumbnails;

  if (!thumbnails) {
    throw new Error(`Could not retrieve channel thumbnail: ${handle}`);
  }

  return (
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    null
  );
}

function matchesInterest(title, interests = []) {
  if (interests.includes("*")) return true;

  const normalizedTitle = title.toLowerCase();

  return interests.some((interest) =>
    normalizedTitle.includes(interest.toLowerCase()),
  );
}

async function getChannelVideos(playlistId, scan) {
  const videos = [];

  const cutoff =
    scan.mode === "days"
      ? Date.now() - scan.value * 24 * 60 * 60 * 1000
      : new Date(scan.afterDate).getTime();

  let pageToken;
  let stopPaging = false;

  do {
    const params = {
      part: "snippet",
      playlistId,
      maxResults: MAX_RESULTS.toString(),
    };

    if (pageToken) params.pageToken = pageToken;

    const data = await youtubeRequest("playlistItems", params);

    for (const item of data.items || []) {
      const snippet = item.snippet;
      const videoId = snippet.resourceId?.videoId;

      if (!videoId) continue;

      const publishedTime = new Date(snippet.publishedAt).getTime();

      // Stop when we reach videos older than our cutoff.
      if (publishedTime < cutoff) {
        stopPaging = true;
        break;
      }

      videos.push({
        videoId,
        title: snippet.title,
        date: snippet.publishedAt.slice(0, 10),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        watched: false,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken && !stopPaging);

  return videos;
}

async function getVideoDurations(videoIds) {
  const durations = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);

    const data = await youtubeRequest("videos", {
      part: "contentDetails",
      id: batch.join(","),
    });

    for (const video of data.items || []) {
      durations[video.id] = video.contentDetails.duration;
    }
  }

  return durations;
}

function isShort(duration) {
  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);

  if (!match) return false;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds <= 120;
}

async function collectYoutubeWatchlist() {
  console.log("Starting YouTube watchlist collection");

  const watchlist = getOldJson(WATCHLIST_FILE);
  const scanStartedAt = new Date().toISOString();

  for (const creator of watchlist) {
    console.log(`Collecting videos: ${creator.name}`);

    try {
      if (!Array.isArray(creator.videos)) {
        creator.videos = [];
      }

      if (!Array.isArray(creator.interested)) {
        creator.interested = [];
      }

      const isInitialCollection = !creator.initialScan?.completed;

      let scan;

      if (isInitialCollection) {
        scan = {
          mode: "days",
          value: creator.initialDays || 60,
        };
      } else {
        // Compatibility with watchlists created before lastCheckedAt.
        const newestVideoDate = creator.videos.reduce(
          (newest, video) => (video.date > newest ? video.date : newest),
          "",
        );

        const afterDate =
          creator.lastCheckedAt ||
          (newestVideoDate
            ? `${newestVideoDate}T00:00:00.000Z`
            : scanStartedAt);

        scan = {
          mode: "after",
          afterDate,
        };
      }

      const playlistId = await getUploadsPlaylist(creator.handle);

      if (!creator.thumbnail) {
        creator.thumbnail = await getChannelThumbnail(creator.handle);
      }

      const fetchedVideos = await getChannelVideos(playlistId, scan);

      const durations = await getVideoDurations(
        fetchedVideos.map((video) => video.videoId),
      );

      const existingLinks = new Set(creator.videos.map((video) => video.link));

      const newVideos = fetchedVideos.filter((video) => {
        const duration = durations[video.videoId];

        if (!duration || isShort(duration)) return false;

        if (!matchesInterest(video.title, creator.interested)) {
          return false;
        }

        return !existingLinks.has(video.link);
      });

      const cleanVideos = newVideos.map(({ videoId, ...video }) => video);

      creator.videos = [...creator.videos, ...cleanVideos].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      if (isInitialCollection) {
        creator.initialScan = {
          completed: true,
        };
      }

      // Only update the timestamp after a successful collection.
      creator.lastCheckedAt = scanStartedAt;

      console.log(`${creator.name}: ${newVideos.length} new videos found`);
    } catch (error) {
      console.error(`${creator.name} collection failed:`, error.message);
    }
  }

  fileWriter("youtube-watchlist", watchlist);

  console.log("YouTube watchlist collection complete");

  return watchlist;
}

module.exports = { collectYoutubeWatchlist };
