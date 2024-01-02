require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const dbMain = require("./src/configs/dbMain.config");
const path = require("path");
const authenticationRoutes = require("./src/routes/users/authentication.routes");
const lakesRoutes = require("./src/routes/lakes/lakes.routes");
const lakeSightingsRoutes = require("./src/routes/lake-sightings/lake-sightings.routes");
const likeLakeSightingRoutes = require("./src/routes/like-lake-sighting/like-lake-sighting.routes");
const { auth } = require("./src/middleware/auth.middelware");

const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};

global.dbMain = dbMain;
global.secretKey = process.env.SECRET_KEY;

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "100mb", extended: true }));

const apiPrefix = "/api/v1";
app.use(apiPrefix, authenticationRoutes);
app.use(apiPrefix, lakesRoutes);
app.use(apiPrefix, likeLakeSightingRoutes);
app.use(apiPrefix, lakeSightingsRoutes);

app.get("/verify/token", auth, (req, res) => {
  console.log({ isValid: req.isValid });
  res.json({ isValid: req.isValid, user: req.user });
});

app.get("/", (req, res) => {
  res.send("LakeXplorer backend is running :) ");
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 400;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
});

const publicDir = path.join(__dirname, "public");
app.use("/public", express.static(publicDir));

app.listen(port, () => {
  const stage = process.env.STAGE || "localhost";
  console.log(`LakeXplorer Backend is running on port ${stage}:${port}!`);
});
