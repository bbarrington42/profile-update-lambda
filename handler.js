'use strict';

const _ = require('underscore');
const db = require('./lib/db');
const validator = require('./lib/valid');
const util = require('./lib/util');
const S3 = require('aws-sdk/clients/s3');
const s3 = new S3();


// Example event structure:
const event = {
    "Records": [
        {
            "eventVersion": "2.1",
            "eventSource": "aws:s3",
            "awsRegion": "us-east-1",
            "eventTime": "2019-02-09T19:59:21.346Z",
            "eventName": "ObjectCreated:Put",
            "userIdentity": {
                "principalId": "AWS:AIDAJ4WE6WYXUXG66XSPM"
            },
            "requestParameters": {
                "sourceIPAddress": "136.55.20.250"
            },
            "responseElements": {
                "x-amz-request-id": "0B90EFD112B8CB49",
                "x-amz-id-2": "Vm2UcI8i8cZ+G64+sE+9FhKJVcT3al+A2wziZAAxBvddpHqxzjKVTb+rAk1AvYRt1zUkN1zMS/4="
            },
            "s3": {
                "s3SchemaVersion": "1.0",
                "configurationId": "dd14a857-feab-4682-b1bd-0f5f923030cb",
                "bucket": {
                    "name": "ccfs-misc-dev",
                    "ownerIdentity": {
                        "principalId": "A2XG4F6ZSJ1FVZ"
                    },
                    "arn": "arn:aws:s3:::ccfs-misc-dev"
                },
                "object": {
                    "key": "beverage-profile-update/profile-update1.csv",
                    "size": 190,
                    "eTag": "3744d236c544738bd614f7db8419ad01",
                    "sequencer": "005C5F311948BCE428"
                }
            }
        }
    ]
};


const run = (bucket, key, config) => {
    console.log(`Invoking s3.getObject: bucket = ${bucket}, key = ${key}`);
    return util.getObjectAsString(s3, bucket, key).then(data => {

        const raw = data.split('\n');
        // Filter out comment lines & empties and then trim each remaining line
        const input = _.filter(raw, line => !line.startsWith('#') && !_.isEmpty(line)).map(line => line.trim());
        console.log(`input: ${JSON.stringify(input)}`);

        // Validate first
        return validator.validateCSV(input).then(() => db.run(input, config));
    });
};

// The trigger for this handler is an upload of the CSV file to S3.
exports.addBeverage = async (event, context) => {
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

    return run(bucket, key, config.db).then(result => {
        console.log(`addBeverage result: ${result}`);
        return result;
    }).catch(err => {
        console.error(err);
        return err;
    });

};
