'use strict';
const utils = require('../utils/writer.js');
const validatorClass = require('../config/validator');

module.exports = async function checkSignature(req, res, next){
    try {
        let signature;
        try {
            signature = req.swagger.params['signature'].value;
        } catch (error) {
            console.log("middleware:: signature is not required");
            return next();
        }
        let validator = validatorClass.getValidator({
            "signature": signature
        })
        if (await validator.checkSignature()) {
            next()
        } else {
            utils.writeJson(res, {
                "responseCode": process.env.UNAUTHORIZED_RESPONSE,
                "responseMessage": "Unauthorize"
            })
        }    
    } catch (error) {
        console.log("checkSignature::", error);
        utils.writeJson(res, {
            "responseCode": process.env.UNAUTHORIZED_RESPONSE,
            "responseMessage": "Unauthorize"
        })
    }
}