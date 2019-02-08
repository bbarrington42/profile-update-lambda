'use strict';

const _ = require('underscore');
const mysql = require('mysql');
const sql = require('./sql');


const dbConn = mysql.createConnection({
    host: "localhost",
    port: 8082,
    database: "cda",
    user: "cda_user",
    password: "password"
});

// Given the header and one line of input, perform the beverage insert
const doInsert = (header, line, callback) => {
    dbConn.connect(function (err) {
        if (err) callback(err); else {
            const query = sql.brandIdQuery(header, line);
            dbConn.query(query, function (err, result) {
                if (err) callback(err); else {
                    // The result should be an array containing one object
                    const obj = result.pop();
                    const brandId = obj['id'];

                    // Now perform the insert
                    const insert = sql.beverageInsert(header, line, brandId);
                    dbConn.query(insert, function (err, result) {
                        if (err) callback(err); else callback(null, result);
                        dbConn.destroy();
                    })
                }
            })
        }
    });
};

// Process the entire CSV file contents. Input is an array of strings where the first line is the header.
exports.run = (input, callback) => {
    const header = input.shift();

    _.forEach(input, line => {
        doInsert(header, line, callback)
    })
};
