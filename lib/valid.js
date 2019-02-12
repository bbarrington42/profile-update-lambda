const _ = require('underscore');

function isBoolean(value) {
    return value == true || value == false;
}

function isString(value) {
    return /'[^']+'/.test(value);
}

function isNumber(value) {
    return !_.isNaN(parseInt(value));
}

const config = {
    validateError: function (headerName, rowNumber, columnNumber) {
        return `${headerName} is not valid in row ${rowNumber} / column ${columnNumber}`
    },
    headers: [
        {
            name: 'country',
            validate: function (value) {
                return isString(value);
            }
        },
        {
            name: 'language',
            validate: function (value) {
                return isString(value);
            }
        },
        {
            name: 'brand_name',
            validate: function (value) {
                return isString(value);
            }
        },
        {
            name: 'active',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'caffeine',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'exclusive',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'kitName',
            validate: function (value) {
                return isString(value);
            }
        },
        {
            name: 'lowCal',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'material',
            validate: function (value) {
                return isNumber(value);
            }
        },
        {
            name: 'sparkling',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'image_url',
            validate: function (value) {
                return isString(value);
            }
        },
        {
            name: 'main',
            validate: function (value) {
                return isBoolean(value);
            }
        },
        {
            name: 'rank',
            validate: function (value) {
                return isNumber(value);
            }
        }
    ]
};

// Parameters are array of strings and a config (see below)
// All strings in the array are expected to be trimmed.
// Returns an array of arrays of errors, one per line of input
exports.validateCSV = (lines, config) => {

    let errors = [];

    // First check the header
    const header = lines.shift().split(/\s*,\s*/);


    if (header.length !== config.headers.length) {
        errors.push([`There should be exactly ${config.headers.length} headers, instead you have ${header.length}`]);
    } else {
        let errs = [];
        _.forEach(config.headers, (obj) => {
            if (!_.contains(header, obj.name)) {
                errs.push(`Missing required header: ${obj.name}`);
            }
        });
        if (!_.isEmpty(errs))
            errors.push(errs);
    }

    if (_.isEmpty(errors)) {
        // Proceed with validation
        _.forEach(lines, (line, row) => {
            let errs = [];
            const values = line.split(/\s*,\s*/);
            _.forEach(values, (value, column) => {
                const headerName = header[column];
                const validator = config.headers[_.findIndex(config.headers, elem => {
                    return elem.name === headerName;
                })];
                if (!validator.validate(value))
                    errs.push(config.validateError(headerName, row + 1, column + 1));
            });
            if (!_.isEmpty(errs))
                errors.push(errs);
        });
    }

    return errors;
};


const testData = [
    "country, language, brand_name, caffeine, active, exclusive, kitName, lowCal, material, sparkling, image_url, main, rank",
    "'US', 'en', 'Woof', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 0, 1"
];

const result = this.validateCSV(testData, config);


console.log(result);
