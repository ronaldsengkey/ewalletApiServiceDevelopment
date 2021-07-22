'use strict';
const utils = require('../utils/writer.js');
const model = require('../models/faq');

module.exports.getFaq = async function(req, res){
    console.log("getFaq::");
    let response = {};
    try {
        let param = req.swagger.params['param'].value;
        if (param) {
            param = JSON.parse(param)
        }
        let result = await model.getFaq(param);
        if (result.length >= 1) {
            response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "success",
                "data": result
            };    
        } else {
            response = {
                "responseCode": process.env.NOTFOUND_RESPONSE,
                "responseMessage": "notfound"
            };
        }
    } catch (error) {
        console.log("getFaq::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}

module.exports.postFaq = async function(req, res){
    console.log("postFaq::");
    let response = {};
    try {
        let param = req.body;
        let result = await model.postFaq(param);
        if (result) {
            response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "success"
            };    
        } else {
            response = {
                "responseCode": process.env.NOTFOUND_RESPONSE,
                "responseMessage": "notfound"
            };
        }
    } catch (error) {
        console.log("postFaq::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}

module.exports.putFaq = async function(req, res){
    console.log("putFaq::");
    let response = {};
    try {
        let param = req.body;
        let result = await model.putFaq(param);
        if (result) {
            response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "success"
            };    
        } else {
            response = {
                "responseCode": process.env.NOTFOUND_RESPONSE,
                "responseMessage": "notfound"
            };
        }
    } catch (error) {
        console.log("putFaq::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}

module.exports.deleteFaq = async function(req, res){
    console.log("deleteFaq::");
    let response = {};
    try {
        let param = req.body;
        let result = await model.deleteFaq(param);
        if (result) {
            response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "success"
            };    
        } else {
            response = {
                "responseCode": process.env.NOTFOUND_RESPONSE,
                "responseMessage": "notfound"
            };
        }
    } catch (error) {
        console.log("deleteFaq::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}