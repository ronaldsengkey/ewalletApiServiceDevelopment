'use strict';
var mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;
const newSchema = new Schema({
    chatId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    raw: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    }
},{
    timestamps: true
});
const newModel = mongoose.model('helpdesk', newSchema);
module.exports = newModel;