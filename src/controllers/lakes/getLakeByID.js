const { query } = require("../../services/db.service");
const { getStaticLakes } = require("../../utils/helper.util");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function getLakeById(req, res) {
  try {
    const { lakeId } = req.params;

    if (!lakeId) throw { message: "LakeId is not defined!" };

    const sql = "SELECT * FROM lakes WHERE id = ?";
    const data = await query({ sql, params: [lakeId], connection: dbMain });

    const lake = data.length !== 0 ? data[0] : getStaticLakes(lakeId);
    if (!lake) throw { message: "Lake not found" };

    return successfulReturn({ data: lake }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
