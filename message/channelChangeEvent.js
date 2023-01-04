function channelChangeEvent(items) {
    return {
        type: 'channelChange',
        payload: items.map(item => {
            return {
                channel: item[0].name,
                data: item[1]
            }
        })
    }
}

module.exports = channelChangeEvent