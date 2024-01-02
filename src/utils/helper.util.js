const { query } = require("../services/db.service");

// Check if user exists function
async function checkIfUserExists(email) {
  const sql = "SELECT * FROM users WHERE email = ?";
  const [user] = await query({
    sql,
    params: [email],
    connection: dbMain,
  });
  return !!user;
}

// Regular expression for email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  checkIfUserExists,
  validateEmail,
};
