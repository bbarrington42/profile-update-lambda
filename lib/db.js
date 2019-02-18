'use strict';

const _ = require('underscore');
const mysql = require('promise-mysql');
const sql = require('./sql');


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
    }).catch(err => Promise.reject(err));
};

// Given a brand ID, insert the beverage
const insertBeverage = (conn, header, line, brandId) => {
    const insert = sql.beverageInsert(header, line, brandId);
    console.log(`Beverage insert: ${insert}`);

    return conn.query(insert).catch(err => Promise.reject(err));
};

// Query for the brand ID, then insert the beverage
exports.doAddBeverage = (conn, header, line) =>
    getBrandId(conn, header, line).then(brandId => insertBeverage(conn, header, line, brandId));

// Connect to the DB
const connect = (config) => {
    console.log(`Connecting via: ${JSON.stringify(config)}`);
    return mysql.createConnection(config).then(conn =>
        Promise.resolve(conn)).catch(err => Promise.reject(err));
};


exports.run = (input, config, op) => {
    const header = input.shift();

    console.log(`Processing ${input.length} records...`);

    let total = 0;
    let success = 0;
    let failure = 0;

    let lineFailures = [];

    const loop = (conn, input) => {
        if (_.isEmpty(input)) {
            conn.end();
            const msg = `total=${total}/success=${success}/failure=${failure} occurring on lines: ${lineFailures.join(', ')}`;
            return Promise.resolve(msg);
        }

        ++total;
        return op(conn, header, input.shift()).then(_ => {
            ++success;
            return loop(conn, input);
        }, err => {
            ++failure;
            lineFailures.push(total);
            console.error(err.toString());
            return loop(conn, input);
        })
    };

    return connect(config).then(conn => loop(conn, input)).catch(err => Promise.reject(err))
};


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

// todo For testing...
//this.run(data, dbConfig);
