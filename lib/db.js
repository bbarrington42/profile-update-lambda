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

// Execute query for Brand ID, returning a Promise containing the result
const getBrandId = (conn, header, line) => {
    const query = sql.brandIdQuery(header, line);
    console.log(`Brand ID query: ${query}`);

    return conn.query(query).then(result => {
        if (_.isEmpty(result))
            return Promise.reject('No brand id found');
        else {
            const obj = result.pop();
            return Promise.resolve(obj['id']);
        }
    }).catch(err => {
        return Promise.reject(err);
    });
};

const insertBeverage = (conn, header, line, brandId) => {
    const insert = sql.beverageInsert(header, line, brandId);
    console.log(`SQL insert: ${insert}`);

    return conn.query(insert).catch(err => {
        return Promise.reject(err)
    });
};


// const doInsert = (conn, header, line) => {
//     const query = sql.brandIdQuery(header, line);
//     console.log(`SQL query: ${query}`);
//
//     return conn.query(query).then(result => {
//         // The result should be an array containing one object
//         if (_.isEmpty(result))
//             return Promise.reject('No brand id found');
//
//         const obj = result.pop();
//
//         const brandId = obj['id'];
//
//         // Now perform the insert
//         const insert = sql.beverageInsert(header, line, brandId);
//         console.log(`SQL insert: ${insert}`);
//
//         return conn.query(insert);
//     }).catch(err => {
//         return Promise.reject(err)
//     })
// };

const addBeverage = (conn, header, line) =>
    getBrandId(conn, header, line).then(brandId => insertBeverage(conn, header, line, brandId));

const connect = (config) => {
    return mysql.createConnection(config).then(conn => {
        console.log(`Connected to: ${JSON.stringify(config)}`);
        return Promise.resolve(conn);
    }).catch(err => Promise.reject(err));
};


exports.run = (input, config) => {
    const header = input.shift();

    console.log(`Processing ${input.length} records...`);

    if (_.isEmpty(input))
        return Promise.resolve('Nothing to do');

    let total = 0;
    let success = 0;
    let failure = 0;

    const loop = (conn, input) => {
        
        if (_.isEmpty(input)) {
            conn.end();
            const msg = `total=${total}/success=${success}/failure=${failure}`;
            console.log(msg);
            return Promise.resolve(msg);
        }

        ++total;
        return addBeverage(conn, header, input.shift()).then(_ => {
            ++success;
            return loop(conn, input);
        }, err => {
            ++failure;
            console.error(err.toString());
            return loop(conn, input);
        })
    };

    return connect(config).then(conn => {
        return loop(conn, input);
    }).catch(err => Promise.reject(err))
};


// exports.run = (input, config) => {
//     return mysql.createConnection(config).then(conn => {
//         console.log(`Connected to: ${JSON.stringify(config)}`);
//         const header = input.shift();
//         console.log(`Processing ${input.length} records...`);
//
//         let total = 0;
//         let success = 0;
//         let failure = 0;
//
//         const doInserts = (input) => {
//             if (_.isEmpty(input)) {
//                 conn.end();
//                 const msg = `total=${total}/success=${success}/failure=${failure}`;
//                 console.log(msg);
//                 return Promise.resolve(msg);
//             }
//             ++total;
//             const line = input.shift();
//             doInsert(conn, header, line).then(result => {
//                 ++success;
//             }).catch(err => {
//                 ++failure;
//                 console.error(`insert failure: ${err.toString()}`);
//             }).finally(() => {
//                 return doInserts(input)
//             })
//         };
//
//         return doInserts(input);
//
//     }, err => {
//         console.error(err.toString());
//         return Promise.reject(err);
//     })
// };


const dbConfig = {
    host: "localhost",
    port: 8082,
    database: "cda",
    user: "cda_user",
    password: "password"
};

const data = [
    "country, language, brand_name, active, caffeine, exclusive, kitName, lowCal, material, sparkling, image_url, main, rank",
    "'US', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 0, 1",
    "'GB', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://wimpy-wimpy', 0, 1"
];

this.run(data, dbConfig).then(console.log);
