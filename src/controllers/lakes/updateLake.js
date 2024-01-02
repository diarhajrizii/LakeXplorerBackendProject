const { updateV2 } = require("../../services/db.service");
const { successfulReturn, errorReturn } = require("../../utils/response");

module.exports = async function updateLake(req, res) {
  try {
    const { lakeId } = req.params;
    const { name, image, description } = req.body;

    if (!name) throw { message: "name is not defined!" };
    if (!image) throw { message: "image is not defined!" };
    if (!description) throw { message: "description is not defined!" };

    // Update details of a specific lake in the database
    await updateV2({
      table_name: "Lakes",
      params: { name, image, description, id: lakeId },
      connection: dbMain,
    });

    // Return success message upon successful update
    return successfulReturn(
      { message: "Lake details updated successfully" },
      res
    );
  } catch (error) {
    console.error(error);
    return errorReturn({ e: error, res });
  }
};
