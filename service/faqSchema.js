'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;
const newSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: false
    },
},{
    timestamps: true
});
const newModel = mongoose.model('faq', newSchema);
module.exports = newModel;