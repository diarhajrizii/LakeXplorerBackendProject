const { query, deleteV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function deleteLakeSighting(req, res) {
  try {
    const { params, user } = req;
    const { sightingId } = params;
    const userId = user.id;

    if (!sightingId) throw { message: "sightingId is not defined!" };

    // Check if the logged-in user created the specified lake sighting
    const checkOwnershipSql = `SELECT user_id FROM LakeSightings WHERE id = ?`;

    const [sighting] = await query({
      sql: checkOwnershipSql,
      params: [sightingId],
      connection: dbMain,
    });

    if (!sighting || sighting.user_id !== userId) {
      throw { message: "Unauthorized or Sighting not found" };
    }

    // Check if the current user has liked this sighting
    const checkLikeSql = `SELECT id FROM likes WHERE user_id = ? AND lake_sighting_id = ?`;

    const [like] = await query({
      sql: checkLikeSql,
      params: [userId, sightingId],
      connection: dbMain,
    });

    // Remove like if it exists
    if (like) {
      const removeLikeSql = `DELETE FROM likes WHERE id = ?`;
      await deleteV2({
        sql: removeLikeSql,
        params: [like.id],
        connection: dbMain,
      });
    }

    // Delete the lake sighting from the database
    const deleteSql = "DELETE FROM LakeSightings WHERE id = ?";
    await deleteV2({
      sql: deleteSql,
      params: [sightingId],
      connection: dbMain,
    });

    // Return success message upon successful deletion
    return successfulReturn(
      { message: "Lake sighting deleted successfully" },
      res
    );
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
