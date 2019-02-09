'use strict';

const db = require('./lib/db');

// The trigger for this handler is an upload of the CSV file to S3.
/*
    This is what an event looks like:
{
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
}
 */


// An array of test data
const input = [
    "country, language, brand_name, active, caffeine, exclusive, kitName, lowCal, material, sparkling, image_url, rank",
    "'US', 'en', 'Woof', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 1",
    //"'GB', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://wimpy-wimpy', 1",
    //"'GB', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blart-blart', 1"
];


// todo Add content validation
exports.addBeverage = async (event, context) => {
    // Examine event and create input for DB update
    console.log(`Event: ${JSON.stringify(event)}`);
    console.log(`Context: ${JSON.stringify(context)}`);

    // todo for now use dummy input just to see if we can connect
    db.run(input, function (err, result) {
        if (err) console.error(`error: ${JSON.stringify(err)}`);
        else console.log(`success: ${JSON.stringify(result)}`);
    })
};

// todo For testing...
//this.addBeverage({}, {});
