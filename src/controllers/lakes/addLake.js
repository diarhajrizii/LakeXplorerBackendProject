const { insertV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function addLake(req, res) {
  try {
    const { name, image, description } = req.body;

    if (!name) throw { message: "name is not defined!" };
    if (!image) throw { message: "image is not defined!" };
    if (!description) throw { message: "description is not defined!" };

    const { insertId } = await insertV2({
      table,
      params: { name, image, description },
      connection: dbMain,
    });

    return successfulReturn({ data: { lakeId: insertId } }, res);
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
