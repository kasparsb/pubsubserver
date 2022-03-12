function Timer() {
    this.start = (new Date()).getTime();
}
Timer.prototype = {
    duration() {
        return Math.round(((new Date()).getTime() - this.start)/1000);
    }
}

module.exports = function(){
    return new Timer()
}