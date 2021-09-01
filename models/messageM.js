var mongoose = require('mongoose').set('debug', true);
var mongoConf = require('../config/mongo');
var schema = require('../service/message');
const request = require('request');
const pgCon = require('../config/pgConfig');

async function getMessage (id) {
    return new Promise(async function(resolve){
        let client = false;
        try {
            let queryParams = {
                $or: [{
                        'senderId': id
                    },
                    {
                        'receiverId': id
                    }
                ]
            };
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            var query = await schema.find(queryParams).sort({
                'created_at': 1
            })
            if (query === null) {
                resolve(process.env.NOTFOUND_RESPONSE);
            } else {
                console.log("getMessage: ", query)
                resolve(query);
            }
        } catch (error) {
            console.log("getMessage: ", err);
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

async function findMessage (data) {
    return new Promise(async function(resolve){
        let client = false;
        try {
            let queryParams = {
                $or: [{
                        'senderId': data.id,
                        'receiverId': data.partnerId
                    },
                    {
                        'senderId': data.partnerId,
                        'receiverId': data.id
                    }
                ]
            };
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            var query = await schema.find(queryParams).sort({
                'created_at': 1
            })
            if (query === null) {
                resolve(process.env.NOTFOUND_RESPONSE);
            } else {
                console.log("GET NOTIF SUCCESS ", query)
                resolve(query);
            }
        } catch (error) {
            console.log("error get findMessage: ", error);
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

async function findOneMessage (id) {
    return new Promise(async function(resolve){
        let client = false;
        try {
            let queryParams = {
                "_id": id
            };
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            var query = await schema.find(queryParams).sort({
                'created_at': 1
            })
            if (query === null) {
                resolve(process.env.NOTFOUND_RESPONSE);
            } else {
                console.log("GET NOTIF SUCCESS ", query)
                resolve(query);
            }
        } catch (error) {
            console.log("error findOneMessage: ", error);
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

async function createMessage (data) {
    return new Promise(async function(resolve){
        let client = false;
        try {
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            var message = new schema({
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: data.message,
                status: data.status,
                type: data.type,
                read: data.read,
            });
    
            await message.save();
            // await saveStatus.set('transactionCode',Buffer.from("O:"+saveStatus._id).toString('base64'));
            // await saveStatus.save();
            return message;
        } catch (err) {
            console.log("createMessage: ", err);
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

async function updateMessage (data) {
    return new Promise(async function(resolve){
        let client = false;
        try {
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            var result = await schema.findOneAndUpdate(data.param, {
                $set: data.data
            }, {
                useFindAndModify: false
            });
            if (result === null) {
                resolve(process.env.NOTFOUND_RESPONSE);
            } else {
                resolve(process.env.SUCCESS_RESPONSE);
            }
        } catch (error) {
            console.log(error)
            resolve(process.env.ERRORINTERNAL_RESPONSE);
        } finally {
            if (client) {
                // console.log("client::", client);
                await mongoose.connection.close();
                console.log("Mongo close");
            }
        }
    })
}

exports.create = function (data) {
    return new Promise(async function (resolve, reject) {
        try {
            console.log('CREATE MESSAGE DATA => ', data)
            let res = await createMessage(data);
            if (res != process.env.NOTFOUND_RESPONSE) {
                console.log('Success create message');
                message = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success create message!",
                    "data": res._id,
                }
                resolve(message);
            } else {
                console.log('Failed create message');
                message = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Failed create message!"
                }
                resolve(message);
            }
        } catch (err) {
            console.log('Error create message ', err)
            message = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Internal server error. Please try again later!"
            }
            resolve(message);
        }
    })
}

exports.find = function (id) {
    return new Promise (async function (resolve, reject) {
        try {
            console.log('GET MESSAGE DATA => ', id)
            let res = await findOneMessage(id);
            if (res != process.env.ERRORINTERNAL_RESPONSE) {
                console.log('Success get message');
                message = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success get message!",
                    "data": res
                }
                resolve(message);
            } else {
                console.log('Failed get message');
                message = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Failed get message!"
                }
                resolve(message);
            }
        } catch (error) {
            console.log('Error get message ', err)
            message = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Internal server error. Please try again later!"
            }
            resolve(message);
        }
    })
}

exports.get = function (data) {
    return new Promise (async function (resolve, reject) {
        try {
            console.log('GET MESSAGE DATA => ', data)
            let res = await findMessage(data);
            if (res != process.env.ERRORINTERNAL_RESPONSE) {
                console.log('Success get message');
                message = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success get message!",
                    "data": res
                }
                resolve(message);
            } else {
                console.log('Failed get message');
                message = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Failed get message!"
                }
                resolve(message);
            }
        } catch (error) {
            console.log('Error get message ', err)
            message = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Internal server error. Please try again later!"
            }
            resolve(message);
        }
    })
}

exports.show = function (id) {
    return new Promise(async function (resolve, reject) {
        try {
            console.log('GET MESSAGE DATA => ', id)
            let res = await getMessage(id);
            if (res != process.env.ERRORINTERNAL_RESPONSE) {
                console.log('Success get message');
                message = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success get message!",
                    "data": res
                }
                resolve(message);
            } else {
                console.log('Failed get message');
                message = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Failed get message!"
                }
                resolve(message);
            }
        } catch (err) {
            console.log('Error get message ', err)
            message = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Internal server error. Please try again later!"
            }
            resolve(message);
        }
    })
}

exports.update = function (data) {
    return new Promise (async function (resolve, reject) {
        try {
            console.log('UPDATE MESSAGE DATA => ', data)
            let res = await updateMessage(data);
            if (res != process.env.ERRORINTERNAL_RESPONSE) {
                console.log('Success update message');
                message = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success update message!",
                }
                resolve(message);
            } else {
                console.log('Failed update message');
                message = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Failed update message!"
                }
                resolve(message);
            }
        } catch (error) {
            console.log('Error update message ', error)
            message = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Internal server error. Please try again later!"
            }
            resolve(message);
        }
    })
}