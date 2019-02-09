'use strict';

const db = require('./lib/db');

// module.exports.hello = async (event, context) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless v1.0! Your function executed successfully!',
//       input: event,
//     }),
//   };
//
//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };


// The trigger for this handler is an upload of the CSV file to S3.
// todo Add content validation


// For now, just use an array of test data
const input = [
    "country, language, brand_name, active, caffeine, exclusive, kitName, lowCal, material, sparkling, image_url, rank",
    "'US', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 1",
    "'GB', 'en', 'Woof', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://wimpy-wimpy', 1",
    "'GB', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blart-blart', 1"
];


const handler = (input) => db.run(input, function (err, result) {
    if (err) console.error(`error: ${JSON.stringify(err)}`);
    else console.log(`success: ${JSON.stringify(result)}`);
});


handler(input);
