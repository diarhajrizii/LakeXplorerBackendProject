const { query } = require("../services/db.service");

async function getMessageCodesByCodes(code) {
  const { data } = await query({
    connection: dbMain,
    sql: "SELECT * FROM message_codes WHERE code = ?",
    params: [code],
  });
  const message = data[0].message_en;
  return message;
}

module.exports = getMessageCodesByCodes;
