'use strict';

const _ = require('underscore');
const db = require('./lib/db');
const validator = require('./lib/valid');
const util = require('./lib/util');
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();


const validateAndGo = (bucket, key, dbConfig, operation) => {
    console.log(`Invoking s3.getObject: bucket = ${bucket}, key = ${key}`);
    return util.getObjectAsString(s3, bucket, key).then(data => {

        const raw = data.split('\n');
        // Filter out comment lines & empties and then trim each remaining line
        const input = _.filter(raw, line => !line.startsWith('#') && !_.isEmpty(line)).map(line => line.trim());
        console.log(`input: ${JSON.stringify(input)}`);

        // Validate first
        return validator.validateCSV(input, operation.validation).then(() => db.run(input, dbConfig, operation.func));
    });
};

// The trigger for this handler is an upload of the CSV file to S3.
const run = async (event, operation) => {
    const data = event.Records.shift(); // Expecting only one record
    const bucket = data.s3.bucket.name;
    const key = data.s3.object.key;

    console.log(`Received event for bucket ${bucket}, key ${key}`);

    const configBucket = process.env.configBucket;
    const configKey = process.env.configKey;

    console.log(`configBucket ${configBucket}, configKey ${configKey}`);

    const config = await util.getObjectAsString(s3, configBucket, configKey).then(JSON.parse);

    if (config === undefined || config.db === undefined) return 'Configuration not found';

    console.log(`config.db: ${JSON.stringify(config.db)}`);

    return validateAndGo(bucket, key, config.db, operation).then(result => {
        console.log(`addBeverage result: ${result}`);
        return result;
    }).catch(err => {
        console.error(err);
        return err;
    });

};

exports.addBeverage = async (event, context) => {

    return run(event, {
        validation: validator.configHeaders.add,
        func: db.doAddBeverage
    }).then(result => result).catch(err => err);
};

exports.updateBeverage = async (event, context) => {

    return run(event, {
        validation: validator.configHeaders.update,
        func: db.doUpdateBeverage
    }).then(result => result).catch(err => err);
};
