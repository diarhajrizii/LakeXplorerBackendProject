const { query } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function getLikesLakeSightings(req, res) {
  try {
    const userId = req.user.id;
    const likesLakeSightings = await query({
      sql: `SELECT * FROM likes WHERE user_id = ?;`,
      params: [userId],
      connection: dbMain,
    });
    console.log({ likesLakeSightings });
    return successfulReturn({ data: likesLakeSightings }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
