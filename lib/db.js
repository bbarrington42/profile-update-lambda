'use strict';

const _ = require('underscore');
const mysql = require('mysql');
const sql = require('./sql');
require('dotenv').config();


const dbConn = mysql.createConnection({
    host: "localhost",
    port: 8082,
    database: "cda",
    user: "cda_user",
    password: "password"
});

// Given the header and one line of input, perform the beverage insert
const doInsert = (dbConn, header, line, callback) => {
    const query = sql.brandIdQuery(header, line);
    console.log(`SQL query: ${query}`);
    dbConn.query(query, function (err, result) {
        if (err) callback(err); else try {
            // The result should be an array containing one object
            const obj = result.pop();
            const brandId = obj['id'];

            // Now perform the insert
            const insert = sql.beverageInsert(header, line, brandId);
            console.log(`SQL insert: ${insert}`);
            dbConn.query(insert, callback);
        } catch (err) {
            // todo Try to propagate the original error
            callback(new Error('Beverage insert failed'));
        }
    })
};

// Process the entire CSV file contents. Input is an array of strings where the first line is the header.
exports.run = (input, callback) => {
    const header = input.shift();

    dbConn.connect(function (err) {
        if (err) callback(err); else {
            // todo Clean this up
            const config = dbConn.config.host + ', ' + dbConn.config.port + ', ' + dbConn.config.database;
            console.log(`Connected: ${config}`);
            let count = 0;
            _.forEach(input, line => {
                doInsert(dbConn, header, line, function (err, result) {
                    if (++count === input.length) dbConn.destroy();
                    if (err) callback(err); else callback(null, result);
                })
            });
        }
    });
};
