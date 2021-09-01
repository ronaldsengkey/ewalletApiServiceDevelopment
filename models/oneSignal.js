'use strict'

const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');
const oneSignalSchema = require('../service/oneSignalSchema');
const request = require('request');

exports.savePlayerId = function(data){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let query = {
				account_id: data.account_id,
				account_category: data.account_category
			}
			let update = {
				account_name: data.account_name,
				player_id: data.player_id,
			};
			let option = {
				upsert: true, 
				new: true, 
				setDefaultsOnInsert: true
			}
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
			let result = await oneSignalSchema.findOneAndUpdate(query, update, option);
			if (result === null) {
				resolve(false);
			} else {
				console.log("savePlayerId: ", result)
				resolve(result);
			} 
        } catch (error) {
            console.log("savePlayerId::", error);
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

exports.sendNotification = function(data){
    return new Promise(async function(resolve){
        try {
            let body = {
                "app_id": process.env.ONESIGNAL_APP_ID,
                "include_player_ids": await getPlayerId(data),
                // "included_segments": ["Active Users"],
                "headings": {
                    "en": data.heading
                },
                "contents": {
                    "en": data.content
                },
                "url": data.url,
                "chrome_web_icon": (data.image ? data.image : process.env.ONESIGNAL_IMAGE),
                "firefox_icon": (data.image ? data.image : process.env.ONESIGNAL_IMAGE)
            }
            return resolve(await sendNotificationRequest(body));
        } catch (error) {
            console.log("sendNotification::", error);
            return resolve(false);
        }
    })
}

async function getPlayerId(data){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let $in = []
            for(let account_id of data.account_id){
                $in.push(account_id);
            }
            let query = {
                "account_category": data.account_category,
                "account_id": { $in }
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await oneSignalSchema.find(query);
            if (result === null) {
                resolve(false);
            } else {
                console.log("getPlayerId: ", result);
                let playerId = [];
                for(let res of result){
                    playerId.push(res.player_id);
                }
                resolve(playerId);
            }
        } catch (error) {
            console.log("getPlayerId::", error);
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

async function sendNotificationRequest(data){
    var options = {
        'method': 'POST',
        'url': process.env.OENESIGNAL_API_URL,
        'headers': {
            'Authorization': 'Basic ' + process.env.ONESIGNAL_API_KEY,
            'Content-Type': 'application/json',
            'Cookie': '__cfduid=d30bf04ae17ed139f12a06cdecd832ab01616038220'
        },
        body: JSON.stringify(data)
    };
    return await sentRequest(options);
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