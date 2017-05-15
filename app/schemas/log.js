const mongoose = require('mongoose');
const log = new mongoose.Schema({
    userId: Number,
    userName: String,
    directory: String,
    result: String,
    files: Array,
    createTime: {
        type: Date,
        default: Date.now()
    }
});
log.pre('save', function(next) {
    this.createTime = Date.now();
    next();
});
log.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('createTime')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({ _id: id })
            .exec(cb)
    }
}
module.exports = log;
