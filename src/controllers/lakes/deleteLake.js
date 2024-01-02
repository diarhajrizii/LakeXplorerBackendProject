const { deleteV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function deleteLake(req, res) {
  try {
    const { lakeId } = req.params;

    if (!lakeId) throw { message: "lakeId is not defined!" };

    const sql = "DELETE FROM Lakes WHERE id = ?";
    await deleteV2({ sql, params: [lakeId], connection: dbMain });

    return successfulReturn({ message: "Lake deleted successfully" }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
