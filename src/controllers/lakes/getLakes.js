const { query } = require("../../services/db.service");
const { getStaticLakes } = require("../../utils/helper.util");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function getLakes(req, res) {
  try {
    // Fetch a list of lakes from the database
    const sql = "SELECT id, name, image, description FROM lakes";
    const data = await query({ sql, params: [], connection: dbMain });

    const lakes = data.length !== 0 ? data : getStaticLakes();

    // Return the list of lakes as a successful response
    return successfulReturn({ data: lakes }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
