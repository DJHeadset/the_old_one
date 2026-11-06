const { getOldJson } = require("../services/getOldJson");

function getYoutubeWatchlist(req, res, next) {
  try {
    const watchlist = getOldJson("youtube-watchlist.json");
    res.status(200).json(watchlist);
  } catch (err) {
    next(err);
  }
}

const {
  collectYoutubeWatchlist,
} = require("../services/youtubeWatchlistService");

async function testYoutubeWatchlist(req, res, next) {
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

module.exports = { getYoutubeWatchlist, testYoutubeWatchlist };
