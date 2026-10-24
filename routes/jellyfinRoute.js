const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { itemAdded } = require("../controllers/jellyfinController");

router.post(
  "/item_added",
  (req, res, next) => {
    const expectedToken = process.env.JELLYFIN_WEBHOOK_TOKEN;
    const suppliedToken = req.query.token;

    if (!expectedToken) {
      console.error("[Jellyfin] Webhook token is not configured");
      return res.status(503).json({ error: "Webhook not configured" });
    }

    if (
      typeof suppliedToken !== "string" ||
      suppliedToken.length !== expectedToken.length ||
      !crypto.timingSafeEqual(
        Buffer.from(suppliedToken),
        Buffer.from(expectedToken),
      )
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  },
  itemAdded,
);

module.exports = router;
