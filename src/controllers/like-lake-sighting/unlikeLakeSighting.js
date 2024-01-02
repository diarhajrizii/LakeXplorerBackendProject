const { query, deleteV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function unlikeLakeSighting(req, res) {
  try {
    const { params, user } = req;
    const { sightingId } = params;
    const userId = user.id;

    if (!sightingId) throw { message: "sightingId is not defined!" };

    const checkLikedSql = `SELECT id FROM likes WHERE user_id = ? AND lake_sighting_id = ?`;
    const [existingLike] = await query({
      sql: checkLikedSql,
      params: [userId, sightingId],
      connection: dbMain,
    });

    if (!existingLike) throw { message: "You have not liked this sighting" };

    // Delete the like for the lake sighting by the user
    const deleteLikeSql = `DELETE FROM likes WHERE user_id = ? AND lake_sighting_id = ?`;
    await deleteV2({
      sql: deleteLikeSql,
      params: [userId, sightingId],
      connection: dbMain,
    });

    // Return success message upon successful unlike
    return successfulReturn({ message: "Sighting unliked successfully" }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
