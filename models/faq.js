'use strict';
const schema = require('../service/faqSchema');

exports.getFaq = async function(data = {
    topic: "",
    answer: ""
}){
    return new Promise(async function(resolve){
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
            let result = await schema.find(param);
            return resolve(result);
        } catch (error) {
            console.log("error::", error);
            return resolve(false)
        }
    })
}

exports.postFaq = async function(data = {
    answer: "",
    topic: ""
}){
    return new Promise(async function(resolve){
        try {
            let newData = new schema({
                topic: data.topic,
                answer: data.answer
            });
            let result = await newData.save();
            return resolve(result);    
        } catch (error) {
            console.log("error::", error);
            return resolve(false)
        }
    })
}

exports.putFaq = async function(data = {
    id: "",
    answer: "",
    topic: ""
}){
    return new Promise(async function(resolve){
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
            let result = await schema.findOneAndUpdate(param, body);
            return resolve(result);    
        } catch (error) {
            console.log("error::", error);
            return resolve(false)
        }
    })
}

exports.deleteFaq = async function(data = {
    id: ""
}){
    return new Promise(async function(resolve){
        try {
            let param = {
                _id: data.id
            }
            let result = await schema.deleteMany(param);
            return resolve(result); 
        } catch (error) {
            console.log("error::", error);
            return resolve(false)           
        }
    })
}