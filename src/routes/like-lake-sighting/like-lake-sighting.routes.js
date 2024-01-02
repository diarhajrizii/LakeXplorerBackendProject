const express = require("express");
const router = express.Router();

const { auth } = require("../../middleware/auth.middelware");

const unlikeLakeSighting = require("../../controllers/like-lake-sighting/unlikeLakeSighting");
const likeLakeSighting = require("../../controllers/like-lake-sighting/likeLakeSighting");
const getLikesLakeSightings = require("../../controllers/like-lake-sighting/getLikeLakeSightings");

router.get("/lake/sightings/likes", auth, getLikesLakeSightings);
router.post("/lake/sightings/:sightingId/like", auth, likeLakeSighting);
router.delete("/lake/sightings/:sightingId/like", auth, unlikeLakeSighting);

module.exports = router;
