async function query({ sql, params = [], connection = dbMain }) {
  return new Promise((resolve, reject) => {
    try {
      if (!connection) throw { message: "Connection is required" };
      if (!sql) throw { message: "Query is required" };
      if (!params) throw { message: "Query values is required" };

      connection.execute(sql, params, (err, result) => {
        if (err) throw err;
        return resolve(result);
      });
    } catch (error) {
      console.log(error);
      return reject({ status: false, message: error.message });
    }
  });
}

async function insertV2({ table_name, params, connection }) {
  return new Promise((resolve, reject) => {
    try {
      if (!table_name) throw { message: "Table name is required" };
      if (!params) throw { message: "column name is required" };
      if (!connection) throw { message: "Connection is required" };

      const columns = Object.keys(params);
      let query = "";
      let query_values = [];
      let insert_query = "";
      let insert_values = "";
      for (let i = 0; i < columns.length; i++) {
        let column_name = columns[i];
        if (params[column_name] == "undefined") {
          continue;
        }
        column_name = column_name.replace(/[^a-zA-Z0-9_]/g, "");
        insert_query += "`" + column_name + "`";
        insert_values += "?";
        if (columns.length != i + 1) {
          insert_query += ", ";
          insert_values += ",";
        }
        query_values.push(params[column_name]);
      }
      query = `INSERT INTO ${table_name} (${insert_query}) VALUES (${insert_values});`;

      connection.query(query, query_values, (err, result) => {
        if (err) throw err;
        return resolve(result);
      });
    } catch (error) {
      return reject({ status: false, message: error.message });
    }
  });
}

async function updateV2({ table_name, params, where, connection }) {
  try {
    if (!connection) throw { message: "Connection is required" };
    if (!table_name) throw { message: "Table name is required" };
    if (!params) throw { message: "Parameters are required" };
    if (!where) throw { message: "Where condition parameter is required" };
    let query = `UPDATE ${table_name} SET `;
    const query_params = [];

    // UPDATE COLUMNS
    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
      const key_name = keys[i];
      query += `${key_name} = ?`;
      query_params.push(params[key_name]);
      if (i + 1 !== keys.length) {
        query += `, `;
      }
    }

    // WHERE
    query += " WHERE ";
    const whereKeys = Object.keys(where);
    for (let i = 0; i < whereKeys.length; i++) {
      const element = whereKeys[i];
      query += `${element} = ?`;
      query_params.push(where[element]);
      if (i + 1 !== whereKeys.length) {
        query += ` AND `;
      }
    }

    // EXECUTE
    const result = await new Promise((resolve, reject) => {
      connection.query(query, query_params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return { status: true, result };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteV2({ sql, params, connection }) {
  return new Promise((resolve, reject) => {
    try {
      if (!connection) throw { message: "Connection is required" };
      if (!sql) throw { message: "Query is required" };
      if (!params) throw { message: "Query values is required" };

      connection.query(sql, params, (err, result) => {
        if (err) throw err;
        return resolve(result);
      });
    } catch (error) {
      console.log(error);
      return reject({ status: false, message: error.message });
    }
  });
}

module.exports = {
  query,
  insertV2,
  deleteV2,
  updateV2,
};
