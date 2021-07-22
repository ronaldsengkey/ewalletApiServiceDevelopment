'use strict';
const crypto = require('crypto');
const request = require('request');

class validator {
    constructor(data) {
        console.log("validator::", data);
        this.signature = data.signature;
        this.token = data.token;
        this.authorization = data.authorization;
        this.v = '1';
        this.flowEntry = 'itDashboard';
        this.continue = data.continue;
        this.appId = false;
    }
    async checkToken() {
        const url = process.env.AUTHENTICATION_SERVICE_HOST + "/identifier?v=" + this.v + "&flowEntry=" + this.flowEntry;
        // console.log("url:", url);
        const options = {
            'method': 'GET',
            'url': url,
            'headers': {
                'token': this.token,
                'Authorization': this.authorization,
            }
        }
        console.log("checkToken options::", options);
        let result = await sentRequest(options);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            return true;
        }
        else {
            return false;
        }
    }
    async checkSignature() {
        // return true;
        const url = process.env.AUTHENTICATION_SERVICE_HOST + "/identifier?v=" + this.v + "&flowEntry=" + this.flowEntry;
        // console.log("url:", url);
        const options = {
            'method': 'GET',
            'url': url,
            'headers': {
                'signature': this.signature,
                'Authorization': this.authorization,
            }
        }
        console.log("checkToken options::", options);
        let result = await sentRequest(options);
        if (result.responseCode == process.env.SUCCESS_RESPONSE) {
            return true;
        } else {
            return false;
        }
    }
    async getData() {
        try {
            const algorithm = 'aes256';
            const secretKey = process.env.AES_KEY_SERVER;
            const iv = process.env.AES_IV_SERVER;
            let decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
            let decrypted = decipher.update(this.token, 'base64', 'utf8');
            let data = JSON.parse(decrypted + decipher.final('utf8'));
            console.log("getData::", data);
            return data;
        } catch (error) {
            console.log("getData::", error);
            return false;
        }
    }
    async fullCheck(){
        if (await this.checkToken() && await this.checkSignature()) {
            return true;
        } else {
            return false;
        }
    }
}

function sentRequest(options){
    return new Promise(async function(resolve){
        request(options, function (error, response) {
            try {
                if (error) {
                    console.log("error::", error);
                    return resolve(false)
                }
                console.log("sentRequest::", response.body);
                try {
                    return resolve(JSON.parse(response.body));
                } catch (error) {
                    return resolve(response.body);   
                }
            } catch (error) {
                console.log("error::", error);
                return resolve(false);
            } 
        });
    })  
}

exports.getValidator = function(data){
    return new validator(data);
}