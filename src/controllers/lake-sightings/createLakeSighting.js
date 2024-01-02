const { insertV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function createLakeSighting(req, res) {
  try {
    const { body, params, file, user } = req;

    const { lakeId } = params;
    const { longitude, latitude, fun_fact } = body;
    const userId = user.id;

    if (!lakeId) throw { message: "likeId is not defined!" };
    if (!longitude) throw { message: "longitude is not defined!" };
    if (!latitude) throw { message: "latitude is not defined!" };

    if (!file) {
      return res.status(400).send("No files were uploaded.");
    }

    const { destination, filename } = file;
    const imagePath = `${destination}${filename}`;

    const insertResult = await insertV2({
      table_name: "LakeSightings",
      params: {
        longitude,
        latitude,
        image: imagePath,
        fun_fact,
        user_id: userId,
        lake_id: lakeId,
      },
      connection: dbMain,
    });

    const data = {
      lakeSightingId: insertResult.insertId,
      imagePath,
    };

    return successfulReturn(
      { data, message: "File uploaded successfully." },
      res
    );
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
