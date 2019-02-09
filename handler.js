'use strict';

const db = require('./lib/db');

// The trigger for this handler is an upload of the CSV file to S3.
// todo Add content validation


// An array of test data
const input = [
    "country, language, brand_name, active, caffeine, exclusive, kitName, lowCal, material, sparkling, image_url, rank",
    "'US', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 1",
    "'GB', 'en', 'Woof', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://wimpy-wimpy', 1",
    "'GB', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blart-blart', 1"
];


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

