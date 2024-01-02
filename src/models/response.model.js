module.exports = function responseModel({ success, data = {}, message = "" }) {
  success = success ? true : false;
  return {
    success,
    data,
    message,
  };
};
