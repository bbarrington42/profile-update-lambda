// Generate SQL statements from CSV input
const _ = require('underscore');

// Generate a query for latest profileId from country & language
const getProfileId = (country, language) => {
    return `select profileId from BeverageProfile where country = '${country}' and language = '${language}' order by version desc limit 1`
};

// Generate a query for brand id using country, language, & brand name
const getBrandId = (country, language, brandName) => {
    return `select b.id from Brand b, BeverageProfile p where b.profile_id = (${getProfileId(country, language)}) and b.name = '${brandName}' limit 1;`
};


// Generate insert for the beverage.
const beverageInsert = (header, line, brandId) => {
    const zipped = _.zip(Array.from(header), Array.from(line));
    // Filter out country, language, & brand_name
    const names = ['country', 'language', 'brand_name'];
    const filtered = _.filter(zipped, _.negate(elem => {
        _.contains(names, elem[0])
    }));
    // Now add the brand id
    filtered.unshift(['brand_id', brandId]);
    const unzipped = _.unzip(filtered);
    return `insert into Beverage (${unzipped[0].join(', ')}) values (${unzipped[1].join(', ')})`
};

// Extract country, language & brand_name from a line of input. First parameter is the header of the CSV file.
const extractCountryLanguageBrandName = (header, line) => {
    const obj = extractData(Array.from(header), Array.from(line), ['country', 'language', 'brand_name']);
    return _.values(obj)
};

// General purpose method to extract data from a line of input. The names of the fields to be extracted are provided as an array.
const extractData = (header, input, names) => {
    const zipped = _.zip(header, input);
    const filtered = _.filter(zipped, elem => {
        return _.contains(names, (elem[0]))
    });
    // Now return an object with the captured values as properties
    let obj = {};
    _.forEach(filtered, elem => {
        obj[elem[0]] = elem[1]
    });

    return obj;
};

// These should be exported
const brandIdQuery = (header, line) => {
    const params = extractCountryLanguageBrandName(header, line1);
    return getBrandId.apply(null, params);
};


// Test data
const header = ['country', 'language', 'brand_name', 'active', 'caffeine', 'exclusive', 'kitName', 'lowCal', 'material', 'sparkling', 'image_url', 'rank']
const line1 = ['US', 'en', 'Coca-Cola', 1, 1, 1, 'Coke', 1, 1234567, 1, 'http://blah-blah', 1]

const query = brandIdQuery(header, line1);

console.log(query);

const insert = beverageInsert(header, line1, 42);

console.log(insert);
