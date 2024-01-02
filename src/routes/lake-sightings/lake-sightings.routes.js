const express = require("express");
const router = express.Router();

const { auth } = require("../../middleware/auth.middelware");
const upload = require("../../middleware/myMulter");

const createLakeSighting = require("../../controllers/lake-sightings/createLakeSighting");
const deleteLakeSighting = require("../../controllers/lake-sightings/deleteLakeSighting");
const getLakeSightings = require("../../controllers/lake-sightings/getLakeSightings");

router.get("/lake/sightings/:lakeId", getLakeSightings);
router.post(
  "/lake/sightings/:lakeId",
  auth,
  upload.single("file"),
  createLakeSighting
);

router.delete("/lake/sightings/:sightingId", auth, deleteLakeSighting);

module.exports = router;
