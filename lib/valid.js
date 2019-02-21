const _ = require('underscore');

function isBoolean(value) {
    const v = parseInt(value);
    return !_.isNaN(v) && (v == 0 || v == 1);
}

function isString(value) {
    return /'[^']+'/.test(value);
}

function isNumber(value) {
    return !_.isNaN(parseInt(value));
}

const addHeaders = [
    {
        name: 'country',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'language',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'brand_name',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'active',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'caffeine',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'exclusive',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'kitName',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'lowCal',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'material',
        required: true,
        validate: function (value) {
            return isNumber(value);
        }
    },
    {
        name: 'sparkling',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'image_url',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'main',
        required: true,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'rank',
        required: true,
        validate: function (value) {
            return isNumber(value);
        }
    }
];

const updateHeaders = [
    {
        name: 'country',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'language',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'brand_name',
        required: true,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'active',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'caffeine',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'exclusive',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'kitName',
        required: false,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'lowCal',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'material',
        required: true,
        validate: function (value) {
            return isNumber(value);
        }
    },
    {
        name: 'sparkling',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'image_url',
        required: false,
        validate: function (value) {
            return isString(value);
        }
    },
    {
        name: 'main',
        required: false,
        validate: function (value) {
            return isBoolean(value);
        }
    },
    {
        name: 'rank',
        required: false,
        validate: function (value) {
            return isNumber(value);
        }
    }
];


exports.configHeaders = {
    add: addHeaders,
    update: updateHeaders
};

const hasDups = (a) => {
    if (_.isEmpty(a)) return false; else {
        const head = a.shift();
        if (_.find(a, elem => elem === head)) return true;
        return hasDups(a);
    }
};


// Parameters are array of strings (contents of the CSV file) and a config which is an array of validation objects (see above)
// All strings in the array are expected to be trimmed.
// Returns a rejected Promise of an array of arrays of errors, one per line of input if there are errors.
// Otherwise a resolved Promise.
exports.validateCSV = (arg, config) => {

    const validateError = (headerName, rowNumber, columnNumber) => {
        return `${headerName} is not valid in row ${rowNumber} / column ${columnNumber}`
    };

    let errors = [];

    if (_.isEmpty(arg)) {
        errors.push('Empty file');
        return Promise.reject(errors);
    }

    // Make shallow copy and trim each line
    let lines = _.map(arg.slice(0), line => line.trim());

    // First check the header
    const header = lines.shift().split(/\s*,\s*/);

    console.log(`header: ${header}`);

    if (hasDups(header.slice(0))) {
        errors.push('Headers must be unique');
        return Promise.reject(errors);
    }

    // Check required and optional columns
    // Partition the contents of the validation array
    const [required, optional] = _.partition(config, elem => elem.required === true);

    const requiredHeaders = _.map(required, elem => elem.name);
    const optionalHeaders = _.map(optional, elem => elem.name);

    console.log(`required headers: ${requiredHeaders}`);
    console.log(`optional headers: ${optionalHeaders}`);

    const intersection = _.intersection(requiredHeaders, header);
    console.log(`intersection: ${intersection}`);

    // Ensure all required headers are present
    if (!_.isEqual(intersection, requiredHeaders))
        errors.push(`Some required headers (${requiredHeaders}) are missing`);

    // Make sure only optional headers remain
    const without = _.without(header, ...requiredHeaders);
    const difference = _.difference(without, optionalHeaders);
    console.log(`without: ${without}`);
    console.log(`difference: ${difference}`);

    if (!_.isEmpty(difference))
        errors.push(`Some optional headers (${difference}) are not valid`);

    if (_.isEmpty(errors)) {
        // Proceed with validation
        _.forEach(lines, (line, row) => {
            let errs = [];
            const values = line.split(/\s*,\s*/);
            if (header.length !== values.length) {
                errs.push(`Row ${row + 2} contains the wrong number of values`);
            } else {
                _.forEach(values, (value, column) => {
                    const headerName = header[column];
                    const validator = config[_.findIndex(config, elem => {
                        return elem.name === headerName;
                    })];
                    if (!validator.validate(value))
                        errs.push(validateError(headerName, row + 2, column + 1));
                });
            }
            if (!_.isEmpty(errs))
                errors.push(errs);
        });
    }

    return _.isEmpty(errors) ? Promise.resolve() : Promise.reject(errors);
};
