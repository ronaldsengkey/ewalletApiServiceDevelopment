'use strict';
const helpdeskSchema = require('../service/helpdeskSchema');
const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');

exports.getHelpdesk = async function(data = {
    type: "",
    from: "",
    text: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let param = {};
            if (data.type) {
                param.type = data.type;
            }
            if (data.from) {
                param.from = data.from;
            }
            if (data.text) {
                param.text = { 
                    $regex: data.text, 
                    $options: 'i' 
                }
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await helpdeskSchema.find(param);
            resolve(result);
        } catch (error) {
            console.log("getHelpdesk::", error);
            resolve(false);
        } finally {
            if (client) {
                // console.log("client::", client);
                await mongoose.connection.close();
                console.log("Mongo close");
            }
        }
    })
}

exports.putHelpdesk = async function(data = {
    id: "",
    status: "",
    category: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let param = {
                _id: data.id
            }
            let body = {}
            if (data.status) {
                body.status = data.status
            }
            if (data.category) {
                body.category = data.category
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await helpdeskSchema.findOneAndUpdate(param, body);
            resolve(result);    
        } catch (error) {
            console.log("putHelpdesk::", error);
            resolve(false);
        } finally {
            if (client) {
                // console.log("client::", client);
                await mongoose.connection.close();
                console.log("Mongo close");
            }
        }
    })
}