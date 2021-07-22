'use strict';
const utils = require('../utils/writer.js');
const helpdeskModel = require('../models/helpdesk');

module.exports.getHelpdesk = async function(req, res){
    console.log("getHelpdesk::");
    let response = {};
    try {
        let param = req.swagger.params['param'].value;
        if (param) {
            param = JSON.parse(param)
        }
        let result = await helpdeskModel.getHelpdesk(param);
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
        console.log("getHelpdesk::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}

module.exports.putHelpdesk = async function(req, res){
    console.log("putHelpdesk::");
    let response = {};
    try {
        let param = req.swagger.params['param'].value;
        if (param) {
            param = JSON.parse(param)
        }
        let result = await helpdeskModel.getHelpdesk(param);
        if (result.length >= 1) {
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
        console.log("putHelpdesk::", error);
        response = {
            "responseCode": process.env.ERRORINTERNAL_RESPONSE,
            "responseMessage": "error"
        };
    }
    utils.writeJson(res, response);
}