function arrayUnique(arr) {
    return Array.from(new Set(arr).values());
}

module.exports = arrayUnique