const multer = require("multer");
// Configure Multer to define storage options
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/"); // Set the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Set the file name for uploaded files
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
