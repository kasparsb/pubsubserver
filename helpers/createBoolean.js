/**
 * Create boolean from string
 */
function createBoolean(value) {
    let r = parseInt(value, 10);

    return r ? true : false;
}

module.exports = createBoolean