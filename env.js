// Read contents of .env file and return as JSON Object
// For use in serverless.yml config file

const LineReaderSync = require("line-reader-sync");

exports.twitterCreds = (serverless) => {
    const lrs = new LineReaderSync("./.env")
    const lines = lrs.toLines();

    let obj = {};
    lines.forEach(line => {
        const elems = line.split('=');
        obj[elems[0]] = elems[1];
    });

    return obj;
};
