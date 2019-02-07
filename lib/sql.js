// Generate SQL statements from CSV input
const _ = require('underscore');

// Generate a query for latest profileId from country & language
const getProfileId = (country, language) => {
    return `select profileId from BeverageProfile where country = ${country} and language = ${language} order by version desc limit 1;`
};

// Get brand id using latest profileId and the brand name
const getBrandId = (profileId, brandName) => {
    return `select id from Brand where profile_id = ${profileId} and name = ${brandName};`
};

// Generate insert for the beverage. Parameters are arrays of column names and values.
const insertBeverage = (columns, values) => {
    return `insert into Beverage (${columns.join(', ')}) values (${values.join(', ')})`
};

// Extract country & language from a line of input. First parameter is the header of the CSV file.


// General purpose method to extract data from a line of input. The names of the fields to be extracted are provided
const extractData = (header, input, names) => {
    const zipped = _.zip(header, input);
    const filtered = _.filter(zipped, elem => {
        return _.contains(names, (elem[0]))
    });
    // Now return an object with the captured values as properties
    let obj = {};
    _.each(filtered, elem => {
        obj[elem[0]] = elem[1]
    });

    return obj;
};

// Test data
const header = ['country', 'language', 'brand_name', 'active', 'caffeine', 'exclusive', 'kitName', 'lowCal', 'material', 'sparkling', 'image_url', 'rank']
const line1 = ['US', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 1]

const r = extractData(header, line1, ['country', 'language']);
console.log(r);
