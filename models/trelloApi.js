const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');
const tokenService = require('../service/tokenService');
const request = require('./request');
const url = process.env.TRELLO_HOST;
const trelloKey = process.env.TRELLO_KEY;

exports.getLoginUrl = function(){
    return url + '/authorize?expiration=never&name=Ultimate Proman&scope=read,write&response_type=token&persist=true&key=' + trelloKey;
}

exports.saveToken = async function(data){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let body = {
                employeeId: data.employeeId,
                token: data.token,
                type: 'trello'
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await tokenService.saveToken(body);
            resolve(result);    
        } catch (error) {
            console.log("saveToken::", error);
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

exports.getToken = async function(data){
    return new Promise(async function(resolve){
        let client = false;
        try {
            let body = {
                employeeId: data.employeeId,
                type: 'trello'
            }
            client = await mongoose.connect(mongoConf.mongoDb.url, mongoConf.mongoDb.options);
            let result = await tokenService.getToken(body);
            resolve(result);    
        } catch (error) {
            console.log("getToken::", error);
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

exports.checkToken = async function(token){
    try {
        var options = {
            'method': 'GET',
            'url': url + `/tokens/${token}/member?key=${trelloKey}&token=${token}`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        if (result == 'invalid token') {
            return false
        }
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.getBoard = async function(data){
    try {
        var options = {
            'method': 'GET',
            'url': url + '/members/me/boards?key=' + trelloKey + '&token=' + data.token,
            'headers': {
                'Cookie': 'dsc=469d7c35bd1bf2765b34951b5a26517cd7987f0c923075645d5c495ce820df80'
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.updateBoard = async function(data){
    try {
        var options = {
            'method': 'PUT',
            'url': url + `/boards/${data.boardId}?key=${trelloKey}&token=${data.token}&name=${data.name}`,
            'headers': {
                'Cookie': 'dsc=469d7c35bd1bf2765b34951b5a26517cd7987f0c923075645d5c495ce820df80'
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.deleteBoard = async function(data){
    try {
        console.log("url::", url + `/boards/${data.boardId}?key=${trelloKey}&token=${data.token}`);
        var options = {
            'method': 'DELETE',
            'url': url + `/boards/${data.boardId}?key=${trelloKey}&token=${data.token}`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.updateList = async function(data){
    try {
        var options = {
            'method': 'PUT',
            'url': url + `/lists/${data.listId}?key=${trelloKey}&token=${data.token}&name=${data.name}`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.deleteList = async function(data){
    try {
        var options = {
            'method': 'PUT',
            'url': url + `/lists/${data.listId}/closed?key=${trelloKey}&token=${data.token}&value=true`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.updateCard = async function(data){
    try {
        var options = {
            'method': 'PUT',
            'url': url + `/cards/${data.cardId}?key=${trelloKey}&token=${data.token}&name=${data.name}&dueComplete=${data.dueComplete}`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.deleteCard = async function(data){
    try {
        var options = {
            'method': 'DELETE',
            'url': url + `/cards/${data.cardId}?key=${trelloKey}&token=${data.token}`,
            'headers': {
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.getList = async function(data){
    try {
        var options = {
            'method': 'GET',
            'url': url + '/board/' + data.boardId + '/lists?key=' + trelloKey + '&token=' + data.token,
            'headers': {
                'Cookie': 'dsc=469d7c35bd1bf2765b34951b5a26517cd7987f0c923075645d5c495ce820df80'
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}

exports.getCard = async function(data){
    try {
        var options = {
            'method': 'GET',
            'url': url + '/lists/' + data.listId + '/cards?key=' + trelloKey + '&token=' + data.token,
            'headers': {
                'Cookie': 'dsc=469d7c35bd1bf2765b34951b5a26517cd7987f0c923075645d5c495ce820df80'
            }
        };
        let result = await request.sentRequest(options);
        return result;
    } catch (error) {
        console.log("error::", error);
        return false
    }
}