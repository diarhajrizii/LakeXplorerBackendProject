const { query } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function getLakeSightings(req, res) {
  try {
    const { lakeId } = req.params;

    if (!lakeId) throw { message: "lakeId is not defined!" };

    const sql = `SELECT * FROM LakeSightings WHERE lake_id = ?`;
    const sightings = await query({
      sql,
      params: [lakeId],
      connection: dbMain,
    });

    // Return the sightings for the specific lake as a successful response
    return successfulReturn({ data: sightings }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
