// Generate SQL statements from CSV input
const _ = require('underscore');

// Generate a query for latest profileId from country & language
const getProfileId = (country, language) => {
    return `select profileId from BeverageProfile where country = ${country} and language = ${language} order by version desc limit 1`
};

// Generate a query for brand id using country, language, & brand name
const getBrandId = (country, language, brandName) => {
    return `select b.id from Brand b, BeverageProfile p where b.profile_id = (${getProfileId(country, language)}) and b.name = ${brandName} limit 1;`
};


// Generate insert for the beverage given array of header and data along with the brand id.
const updateBeverage = (header, line, brandId) => {
    const zipped = _.zip(header, line);
    // Filter out country, language, & brand_name
    const names = ['country', 'language', 'brand_name'];
    const filtered = _.reject(zipped,elem => {
        return _.contains(names, elem[0])
    });
    // Now add the brand id
    filtered.unshift(['brand_id', brandId]);
    const unzipped = _.unzip(filtered);

    const columns = unzipped[0];
    const values = unzipped[1]

    return `insert into Beverage (${columns.join(', ')}) values (${values.join(', ')});`
};

// Extract country, language & brand_name from a line of input. First parameter is the header of the CSV file.
const extractCountryLanguageBrandName = (header, line) => {
    const obj = extractData(header, line, ['country', 'language', 'brand_name']);
    return _.values(obj)
};

// General purpose method to extract data from a line of input. The names of the fields to be extracted are provided as an array.
const extractData = (header, input, names) => {
    const zipped = _.zip(header, input);
    const filtered = _.filter(zipped, elem => {
        return _.contains(names, elem[0])
    });
    // Now return an object with the captured values as properties
    let obj = {};
    _.forEach(filtered, elem => {
        obj[elem[0]] = elem[1]
    });

    return obj;
};


exports.brandIdQuery = (header, line) => {
    const params = extractCountryLanguageBrandName(header.split(/\s*,\s*/), line.split(/\s*,\s*/));
    return getBrandId.apply(null, params);
};

exports.beverageInsert = (header, line, brandId) => {
    return updateBeverage(header.split(/\s*,\s*/), line.split(/\s*,\s*/), brandId);
};
