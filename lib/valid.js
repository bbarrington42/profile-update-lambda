const _ = require('underscore');

function isCountryValid(country) {
    // todo
    return country.length === 2;
}
const config = {
    headers: [
        {
            name: 'country',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return isCountryValid(email)
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'language',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'brand_name',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'active',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'caffeine',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'exclusive',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'kitName',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'lowCal',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'material',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'sparkling',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'image_url',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'main',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
            }
        },
        {
            name: 'rank',
            unique: true,
            required: true,
            uniqueError: function (headerName) {
                return `${headerName} is not unique`
            },
            requiredError: function(headerName) {
                return `${headerName} is required`
            },
            validate: function (country) {
                return true;
            },
            validateError: function (headerName, rowNumber, columnNumber) {
                return `${headerName} is not valid in the ${rowNumber} row / ${columnNumber} column`
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


    if(header.length !== config.headers.length) {
        errors.push([`There should be exactly ${config.headers.length} headers, instead you have ${header.length}`]);
    } else {
        let errs = [];
        _.forEach(config.headers, (obj) => {
            if (!_.contains(header, obj.name)) {
                errs.push(`Missing required header: ${obj.name}`);
            }
        })
        errors.push(errs);
    }

    if(_.isEmpty(errors)) {
        // Proceed with validation
    }

    return errors;
};


const testData = [
    "country, language, brand_name, active, caffeine, exclusive, kitName, lowCal, material, sparkling, image_url, main, rank"
];

const result = this.validateCSV(testData, config);


console.log(result);
