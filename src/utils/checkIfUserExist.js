const { query } = require("../services/db.service");

module.exports = async function checkIfUserExists(email) {
  const sql = "SELECT * FROM users WHERE email = ?";
  const [user] = await query({
    sql,
    params: [email],
    connection: dbMain,
  });
  return !!user; // Returns true if user exists, false otherwise
};
