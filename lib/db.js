'use strict';

const _ = require('underscore');
const mysql = require('mysql');
const sql = require('./sql');
require('dotenv').config();


const dbConn = mysql.createConnection({
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db_database,
    user: process.env.db_user,
    password: process.env.db_password
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
            console.error(`Exception: ${err.toString()}`);
            callback(err);
        }
    })
};

// Process the entire CSV file contents. Input is an array of strings where the first line is the header.
exports.run = (input, callback) => {
    const header = input.shift();

    dbConn.connect(function (err) {
        if (err) {
            console.error(`connection failure: ${err.toString()}`);
            callback(err);
        } else {
            console.log(`Connected to: ${JSON.stringify(dbConn.config)}`);
            let count = 0;
            _.forEach(input, line => {
                doInsert(dbConn, header, line, function (err) {
                    if (err) console.error(`insert failure: ${err.toString()}`);
                    if (++count === input.length) {
                        dbConn.end(err => {
                            if(err) callback(err);
                            callback(null, 'CSV data processed');
                        });
                    }
                })
            });
        }
    });

};
