const { query, insertV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function likeLakeSighting(req, res) {
  try {
    const { params, user } = req;
    const { sightingId } = params;
    const userId = user.id;

    if (!sightingId) throw { message: "sightingId is not defined!" };

    // Check if the user has already liked the lake sighting
    const checkLikedSql = `SELECT id FROM likes WHERE user_id = ? AND lake_sighting_id = ?`;

    const [existingLike] = await query({
      sql: checkLikedSql,
      params: [userId, sightingId],
      connection: dbMain,
    });

    if (existingLike) throw { message: "You have already liked this sighting" };

    await insertV2({
      table_name: "likes",
      params: { user_id: userId, lake_sighting_id: sightingId },
      connection: dbMain,
    });

    // Return success message upon successful like
    return successfulReturn({ message: "Sighting liked successfully" }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
