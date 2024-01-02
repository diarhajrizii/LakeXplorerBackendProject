const responseModel = require("../models/response.model");
const getHeaders = require("./getHeaders");

module.exports = {
  successfulReturn: ({ message, data }, res) => {
    const resData = {
      success: true,
      data,
      message,
    };
    res.set(getHeaders({ method: "all" }));
    return res.json(responseModel(resData));
  },

  errorReturn: ({ e, res }) => {
    const resData = {
      success: false,
      message: e.message,
    };

    res.set(getHeaders({ method: "all" }));
    return res.status(400).json(responseModel(resData));
  },
};
