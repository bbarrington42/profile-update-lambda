// Generate SQL statements from CSV input
const _ = require('underscore');

// Generate a query for latest profileId from country & language
const getProfileId = (country, language) =>
    `select profileId from BeverageProfile where country = ${country} and language = ${language} order by version desc limit 1`;

// Generate a query for brand id using country, language, & brand name
const getBrandId = (country, language, brandName) =>
    `select id from Brand where name = ${brandName} and profile_id = (${getProfileId(country, language)})`;

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
const insertBeverage = (header, line, brandId) => {
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

// Generate the SQL for a Beverage update
const updateBeverage = (header, line) => {
    // Example SQL:
    // update Beverage set main = 1 where material = 1952425 and brand_id = (select id from Brand where name = 'Pibb-Xtra' and profile_id = (select profileId from BeverageProfile where country = 'US' and language = 'en' order by version desc limit 1));

    // Partition the data into two objects. The left will contain country, language, brand_name, material and the right
    // will contain the remaining records to update.
    const keys = ['material', 'country', 'language', 'brand_name'];
    const zipped = _.zip(header, line);
    console.log(`zipped = ${zipped}`);
    const [left, right] = _.partition(zipped, elem => _.contains(keys, elem[0]));

    console.log(`left = ${JSON.stringify(left)}, right = ${JSON.stringify(right)}`);

    // Convert left into an object for easy lookup and map the keys array to get the parameters in order
    const obj = _.object(left);
    const params = _.map(keys, key => obj[key]);

    // Map the right to: key = value pairs joined by ', '
    const values = _.map(right, elem => `${elem[0]} = ${elem[1]}`).join(', ');

    return `update Beverage set ${values} where material = ${params[0]} and brand_id = (${getBrandId(params[1], params[2], params[3])})`;
};

// Extract country, language & brand_name from a line of input. First parameter is the header of the CSV file.
const extractCountryLanguageBrandName = (header, line) => {
    const obj = extractData(header, line, ['country', 'language', 'brand_name']);
    return _.values(obj)
};

// General purpose method to extract data from a line of input. The names of the fields to be extracted are provided as an array.
// Field names/values are returned as a JSON object
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
    insertBeverage(header.split(/\s*,\s*/), line.split(/\s*,\s*/), brandId);

exports.beverageUpdate = (header, line) =>
    updateBeverage(header.split(/\s*,\s*/), line.split(/\s*,\s*/));



// Testing
const header = 'country, language, brand_name, material, active, caffeine, exclusive, kitName, lowCal, sparkling, image_url, main, rank';
const line = '\'GB\', \'en\', \'Coca-Cola\', 1234567, 1, 1, 1, \'Coke\', 1, 1, \'http://wimpy-wimpy\', 0, 1';

// const res = updateBeverage(header.split(/\s*,\s*/), line.split(/\s*,\s*/));
//
// console.log(res);
