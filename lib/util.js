// Miscellaneous utilities

exports.getObjectAsString = (s3, bucket, key) => {
    return new Promise((resolve, reject) => {
        s3.getObject({
            Bucket: bucket,
            Key: key
        }, (err, data) => {
            if (err) {
                const msg = `getObject failed: ${err.toString()}`;
                console.error(msg);
                reject(msg);
            } else {
                console.log(`data: ${JSON.stringify(data)}`);
                resolve(data.Body.toString());
            }
        })
    })
};
