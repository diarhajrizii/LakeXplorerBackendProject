const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { query } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");
module.exports = async function signIn(req, res) {
  try {
    const { email, password } = req.body;

    if (!email) throw { message: "Email parameter is missing!" };
    if (!password) throw { message: "Password parameter is missing!" };

    // Check if the user exists in the database
    const sql = "SELECT * FROM users WHERE email = ?";
    const [user] = await query({ sql, params: [email], connection: dbMain });

    if (!user) {
      throw { message: "Invalid email or password" };
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw { message: "Invalid email or password" };
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: "1h",
    });
    console.log({ token });

    return successfulReturn({ data: token }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
