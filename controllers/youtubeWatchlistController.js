const { fileWriter } = require("../services/fileWriter");
const { getOldJson } = require("../services/getOldJson");
const {
  collectYoutubeWatchlist,
} = require("../services/youtubeWatchlistService");

function getYoutubeWatchlist(req, res, next) {
  try {
    const watchlist = getOldJson("youtube-watchlist.json");
    res.status(200).json(watchlist);
  } catch (err) {
    next(err);
  }
}

async function complieYoutubeWatchlist(req, res, next) {
  try {
    const watchlist = await collectYoutubeWatchlist();

    res.status(200).json({
      success: true,
      channels: watchlist.map((creator) => creator.name),
      counts: Object.fromEntries(
        watchlist.map((creator) => [creator.name, creator.videos.length]),
      ),
    });
  } catch (err) {
    next(err);
  }
}

async function watchedVideo(req, res, next) {
  const { creator, id } = req.body;
  try {
    const watchlist = getOldJson("youtube-watchlist.json");
    const selectedCreator = watchlist.find((item) => item.name === creator);
    const selectedVideo = selectedCreator?.videos[id];
    const watchedDate = new Date().toISOString().slice(0, 10);
    selectedVideo.watched = watchedDate;

    fileWriter("youtube-watchlist", watchlist);
    res.status(200).json({
      success: true,
      creator,
      id,
      watched: watchedDate,
    });
  } catch (err) {
    next(err);
  }
}

async function seenVideo(req, res, next) {
  const { creator, id } = req.body;

  try {
    const watchlist = getOldJson("youtube-watchlist.json");

    const selectedCreator = watchlist.find(
      (creatorChannel) => creatorChannel.name === creator,
    );

    if (!selectedCreator || !selectedCreator.videos[id]) {
      return res.status(404).json({
        success: false,
        message: "Creator or video not found",
      });
    }

    selectedCreator.videos[id].new = false;

    fileWriter("youtube-watchlist", watchlist);

    console.log(`Marked as seen: ${creator}, video ${id}`);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getYoutubeWatchlist,
  complieYoutubeWatchlist,
  watchedVideo,
  seenVideo,
};
