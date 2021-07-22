require('dotenv').config();
const request = require('request');

exports.checkToken = function(token) {
    return new Promise(function (resolve, reject) {
        try {
            request.get({
                "headers": {
                    "content-type": "application/json",
                    "signature": "xxx" //masih hardcode
                },
                "url": process.env.AUTHENTICATION_SERVICE_HOST + "/check/" + token,
            }, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                }
                let result = JSON.parse(body);
                console.log('RESULT CHECK TOKEN => ', result)
                if (result.responseCode == process.env.SUCCESS_RESPONSE) {
                    resolve(result);
                } else if (result.responseCode == process.env.NOTACCEPT_RESPONSE) {
                    resolve(process.env.NOTFOUND_RESPONSE);
                } else {
                    resolve(process.env.ERRORINTERNAL_RESPONSE);
                }
            })
        } catch (e) {
            console.log('Error checking token => ', e)
            reject(process.env.ERRORINTERNAL_RESPONSE);
        }
    })
}