const express = require("express");
const router = express.Router();

const { auth } = require("../../middleware/auth.middelware");

const getLakeById = require("../../controllers/lakes/getLakeByID");
const getLakes = require("../../controllers/lakes/getLakes");
const updateLake = require("../../controllers/lakes/updateLake");
const deleteLake = require("../../controllers/lakes/deleteLake");
const addLake = require("../../controllers/lakes/addLake");

router.get("/lakes", getLakes);
router.get("/lakes/:lakeId", getLakeById);
router.put("/lakes/:lakeId", auth, updateLake);
router.post("/lakes", auth, addLake);
router.delete("/lakes/:lakeId", auth, deleteLake);

module.exports = router;
