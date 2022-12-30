/**
 * If value is not array then create array and
 * put value as first item of array
 * Make sure that return is always array
 * Filter out empty values
 */
function createArray(value) {
    let r = Array.isArray(value) ? value : [value];

    return r
        .map(value => value ? value.trim() : null)
        .filter(value => value ? true : false)
}

module.exports = createArray