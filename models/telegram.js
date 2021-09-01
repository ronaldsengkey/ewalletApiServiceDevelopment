var request = require('request');
const token = process.env.TELEGRAM_BOT_TOKEN;
const _this = this;
const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');
const botSchema = require('../service/telegramBotSchema');

exports.getSubscriber = async function(data){
    return new Promise(async function(resolve){
        let client = false;
        try {
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await botSchema.find(data).select({
                "_id": 0,
                "chatId": 1,
                "name": 1,
                "type": 1,
            }).sort({
                name: 1
            });
            resolve(result);
        } catch (error) {
            console.log("getSubscriber::", error);
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

exports.sendMessages = async function(data){
    let response = false;
    try {
        let chat_ids = data.chat_id.split(",");
        for(let chat_id of chat_ids){
            let body = {
                "chat_id": chat_id,
                "text": data.text,
                "parse_mode": data.parse_mode
            }
            await _this.sendNotification(body);
        }
        response = true
    } catch (error) {
        console.log("sendMessages::", error);
    }
    return response;
}

exports.sendNotification = async function(data){
    try {
        let response = false;
        const options = {
            'method': 'POST',
            'url': 'https://api.telegram.org/bot' + token + '/sendMessage',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        response = await sentRequest(options)
        return response
    } catch (error) {
        console.log("sendNotification::", error);
        return resolve(false);
    }
}

function sentRequest (options){
    console.log("options::", options);
    return new Promise(async function(resolve){
        request(options, function (error, response) {
            if (error) {
                console.log("error::", error);
                return resolve(false);
            }
            console.log("sentRequest::", response.body);
            try {
                return resolve(JSON.parse(response.body))
            } catch (error) {
                return resolve(response.body)   
            }
        });
    })
}