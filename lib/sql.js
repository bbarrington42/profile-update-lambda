// Generate SQL statements from CSV input
const _ = require('underscore');

// Generate a query for latest profileId from country & language
const getProfileId = (country, language) =>
    `select profileId from BeverageProfile where country = ${country} and language = ${language} order by version desc limit 1`;

// Generate a query for brand id using country, language, & brand name
const getBrandId = (country, language, brandName) =>
    `select b.id from Brand b, BeverageProfile p where b.profile_id = (${getProfileId(country, language)}) and b.name = ${brandName} limit 1;`;

const timestamp = () => {
    const now = new Date();

    const yyyy = now.getUTCFullYear();
    const MM = ('0' + now.getUTCMonth() + 1).slice(-2);
    const dd = ('0' + now.getUTCDate()).slice(-2);
    const hh = ('0' + now.getUTCHours()).slice(-2);
    const mm = ('0' + now.getUTCMinutes()).slice(-2);
    const ss = ('0' + now.getUTCSeconds()).slice(-2);

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
};

// Generate insert for the beverage given array of header and data along with the brand id.
const updateBeverage = (header, line, brandId) => {
    const zipped = _.zip(header, line);
    // Filter out country, language, & brand_name
    const names = ['country', 'language', 'brand_name'];
    const filtered = _.reject(zipped, elem => {
        return _.contains(names, elem[0])
    });
    // Now add the brand id
    filtered.unshift(['brand_id', brandId]);

    // And the timestamps
    const ts = timestamp();
    filtered.unshift(['createdAt', `'${ts}'`]);
    filtered.unshift(['updatedAt', `'${ts}'`]);

    const unzipped = _.unzip(filtered);

    const columns = unzipped[0];
    const values = unzipped[1];

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
    _.forEach(filtered, elem => obj[elem[0]] = elem[1]);

    return obj;
};


exports.brandIdQuery = (header, line) => {
    const params = extractCountryLanguageBrandName(header.split(/\s*,\s*/), line.split(/\s*,\s*/));
    return getBrandId.apply(null, params);
};

exports.beverageInsert = (header, line, brandId) =>
    updateBeverage(header.split(/\s*,\s*/), line.split(/\s*,\s*/), brandId);
