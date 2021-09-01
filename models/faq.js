'use strict';
const schema = require('../service/faqSchema');
const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');

exports.getFaq = async function(data = {
    topic: "",
    answer: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let param = {};
            if (data.topic) {
                param.topic = { 
                    $regex: data.topic, 
                    $options: 'i' 
                }
            }
            if (data.answer) {
                param.answer = { 
                    $regex: data.answer, 
                    $options: 'i' 
                }
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await schema.find(param);
            resolve(result);
        } catch (error) {
            console.log("getFaq::", error);
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

exports.postFaq = async function(data = {
    answer: "",
    topic: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let newData = new schema({
                topic: data.topic,
                answer: data.answer
            });
            let result = await newData.save();
            resolve(result);    
        } catch (error) {
            console.log("postFaq::", error);
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

exports.putFaq = async function(data = {
    id: "",
    answer: "",
    topic: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let param = {
                _id: data.id
            }
            let body = {}
            if (data.topic) {
                body.topic = data.topic
            }
            if (data.answer) {
                body.answer = data.answer
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await schema.findOneAndUpdate(param, body);
            resolve(result);    
        } catch (error) {
            console.log("putFaq::", error);
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

exports.deleteFaq = async function(data = {
    id: ""
}){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let param = {
                _id: data.id
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await schema.deleteMany(param);
            resolve(result); 
        } catch (error) {
            console.log("deleteFaq::", error);
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