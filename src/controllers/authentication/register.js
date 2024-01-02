const { insertV2 } = require("../../services/db.service");
const { validateEmail, checkIfUserExists } = require("../../utils/helper.util");
const { successfulReturn, errorReturn } = require("../../utils/response");
const bcrypt = require("bcrypt");

module.exports = async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    if (!email) throw { message: "Email parameter is missing!" };
    if (!validateEmail(email)) throw { message: "Invalid email format!" };
    if (!username) throw { message: "Username parameter is missing!" };
    if (!password) throw { message: "Password parameter is missing!" };

    // Check if the email is already registered
    const userExists = await checkIfUserExists(email);

    if (userExists) throw { message: "Email already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await insertV2({
      table_name: "users",
      params: { email, username, password: hashedPassword },
      connection: dbMain,
    });

    return successfulReturn({ message: "User registered successfully" }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
