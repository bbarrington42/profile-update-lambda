'use strict';

const _ = require('underscore');
const mysql = require('promise-mysql');
const sql = require('./sql');

//
// const dbConn = mysql.createConnection({
//     host: process.env.db_host,
//     port: process.env.db_port,
//     database: process.env.db_database,
//     user: process.env.db_user,
//     password: process.env.db_password
// });
//
//
// // Given the header and one line of input, perform the beverage insert
// const doInsert = (dbConn, header, line, callback) => {
//
//     const query = sql.brandIdQuery(header, line);
//     console.log(`SQL query: ${query}`);
//     dbConn.query(query, function (err, result) {
//         if (err) callback(err); else try {
//             // The result should be an array containing one object
//             const obj = result.pop();
//             const brandId = obj['id'];
//
//             // Now perform the insert
//             const insert = sql.beverageInsert(header, line, brandId);
//             console.log(`SQL insert: ${insert}`);
//             dbConn.query(insert, callback);
//         } catch (err) {
//             console.error(`Exception: ${err.toString()}`);
//             callback(err);
//         }
//     })
// };
//
// // Process the entire CSV file contents. Input is an array of strings where the first line is the header.
// exports.run = (input, callback) => {
//     const header = input.shift();
//
//     console.log(`Processing ${input.length} records...`);
//     dbConn.connect(function (err) {``
//         if (err) {
//             console.error(`connection failure: ${err.toString()}`);
//             callback(err);
//         } else {
//             console.log(`Connected to: ${JSON.stringify(dbConn.config)}`);
//             let count = 0;
//             let success = 0;
//             let failure = 0;
//             _.forEach(input, line => {
//                 doInsert(dbConn, header, line, function (err) {
//                     if (err) {
//                         ++failure;
//                         console.error(`insert failure: ${err.toString()}`);
//                     } else ++success;
//
//                     if (++count === input.length) {
//                         dbConn.end(err => {
//                             if(err) callback(err);
//                             callback(null, `total=${count}/success=${success}/failure=${failure}`);
//                         });
//                     }
//                 })
//             });
//         }
//     });
//
// };

const dbConfig = {
    host: process.env.db_host,
    port: process.env.db_port,
    database: process.env.db_database,
    user: process.env.db_user,
    password: process.env.db_password
};

const doInsert = (conn, header, line) => {
    const query = sql.brandIdQuery(header, line);
    console.log(`SQL query: ${query}`);

    return conn.query(query).then(result => {

        // The result should be an array containing one object
        const obj = result.pop();
        const brandId = obj['id'];

        // Now perform the insert
        const insert = sql.beverageInsert(header, line, brandId);
        console.log(`SQL insert: ${insert}`);

        return conn.query(insert);
    })
};

exports.run = input => {
    return mysql.createConnection(dbConfig).then(conn => {
        console.log(`Connected to: ${JSON.stringify(dbConfig)}`);
        const header = input.shift();
        console.log(`Processing ${input.length} records...`);

        let count = 0;
        let success = 0;
        let failure = 0;

        _.forEach(input, async line =>
            await doInsert(conn, header, line).then((result, err) => {
                if (err) {
                    ++failure;
                    console.error(`insert failure: ${err.toString()}`);
                } else ++success;

                if (++count === input.length) {
                    conn.end();
                    return `total=${count}/success=${success}/failure=${failure}`;
                }
            }))
    }, err => {
        console.error(err.toString());
        return Promise.reject(err);
    })
};
