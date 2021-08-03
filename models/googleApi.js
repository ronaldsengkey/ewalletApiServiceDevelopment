require('dotenv').config();

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const mongoose = require('mongoose').set('debug', true);
const mongoConf = require('../config/mongo');
const schema = require('../service/googleTokenSchema');
const googleAuthSchema = require('../service/googleAuthenticatorSchema');
const moment = require('moment');
const request = require('request');
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/gmail.modify'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Calendar API.
// //   authorize(JSON.parse(content), listEvents);
//   authorize(JSON.parse(content), insertEvent);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
// function authorize(credentials, callback) {
//   const {client_secret, client_id, redirect_uris} = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[1] + ':8101/googleCalendar/token/id'
//       );

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
// function listEvents(auth) {
//   const calendar = google.calendar({version: 'v3', auth});
//   calendar.events.list({
//     calendarId: 'primary',
//     timeMin: (new Date()).toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   }, (err, res) => {
//     if (err) return console.log('The API returned an error: ' + err);
//     const events = res.data.items;
//     if (events.length) {
//       console.log('Upcoming 10 events:');
//       events.map((event, i) => {
//         const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);
//       });
//     } else {
//       console.log('No upcoming events found.');
//     }
//   });
// }

// function insertEvent(auth){
//     const calendar = google.calendar({version: 'v3', auth});
//     var event = {
//         'summary': 'Coba dari gcal api',
//         'location': '800 Howard St., San Francisco, CA 94103',
//         'description': 'A chance to hear more about Google\'s developer products.',
//         'start': {
//             'dateTime': '2020-05-28T09:00:00-07:00',
//             'timeZone': 'America/Los_Angeles',
//         },
//         'end': {
//             'dateTime': '2020-05-28T17:00:00-07:00',
//             'timeZone': 'America/Los_Angeles',
//         },
//         'recurrence': [
//             'RRULE:FREQ=DAILY;COUNT=2'
//         ],
//         'attendees': [
//             {'email': 'lpage@example.com'},
//             {'email': 'sbrin@example.com'},
//         ],
//         'reminders': {
//             'useDefault': false,
//             'overrides': [
//             {'method': 'email', 'minutes': 24 * 60},
//             {'method': 'popup', 'minutes': 10},
//             ],
//         },
//     };
        
//     calendar.events.insert({
//         auth: auth,
//         calendarId: 'primary',
//         resource: event,
//     }, function(err, event) {
//         if (err) {
//             console.log('There was an error contacting the Calendar service: ' + err);
//             return;
//         }
//         console.log('Event created: %s', event.htmlLink);
//     });
// }

exports.getAuth2Client = function(hostname = 'http://localhost:8100'){
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_ID, process.env.GOOGLE_OAUTH_SECRET, hostname + process.env.GOOGLE_OAUTH_URL
    );
    return oAuth2Client;
}

exports.getAccessTokenUrl = function (oAuth2Client){
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });
    return {
        "responseCode": process.env.EXPIRED_TOKEN_RESPONSE,
        "responseMessage": "Please login to google first",
        "data": {
            "url": authUrl
        }
    }
}

exports.getAuthorize = function (employeeId, oAuth2Client){
    return new Promise(async function(resolve, reject){
        try {
            let token = await getToken(employeeId);
            if (token) {
                oAuth2Client.setCredentials(JSON.parse(token));
                resolve(oAuth2Client);
            }
            else {
                resolve(false);
            }    
        } catch (error) {
            resolve(false);
        }
    })
}

async function getToken (id) {
    try {
        let queryParams = {
            employeeId: id
        };
        // mongoose.Promise = global.Promise;
        // await mongoose.connect(mongoConf.mongoDb.url);
        var query = await schema.findOne(queryParams);
        if (query === null) {
            return false;
        } else {
            console.log("getToken: ", query)
            return query.token;
        }
    } catch (error) {
        console.log("getToken: ", error);
        return false
    }
}


//data = {employeeId, code}
exports.createGoogleToken = function(data, oAuth2Client) {
    return new Promise(async function(resolve, reject){
        let response = {};
        try {
            console.log('code: ', data.code);
            const {tokens} = await oAuth2Client.getToken(data.code);
            let result = await saveToken(data.employeeId, JSON.stringify(tokens));
            if (result) {
                response = {
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Succes save token"
                }
            }
            else {
                response = {
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Something wrong please try again!!"
                }
            }
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong please check your google code!!"
            }
        }
        resolve(response);
    })
}

async function saveToken(employeeId, token){
    // await mongoose.connect(mongoConf.mongoDb.url);
    var googleToken = new schema({
        employeeId: employeeId,
        token: token
    });
    await googleToken.save();
    return googleToken;
}

exports.insertEvent = function(data, auth){
    return new Promise(async function(resolve, reject){
        let response = {}
        try {
            const calendar = google.calendar({version: 'v3', auth});
            var event = {
                'summary': data.summary,
                'location': data.place,
                'description': data.description,
                'start': {
                    'dateTime': moment(data.date + 'T' + data.time).format(),
                    'timeZone': data.timeZone,
                },
                'end': {
                    'dateTime': moment(data.date + 'T' + data.time).add(data.duration, 'hour').format(),
                    'timeZone': data.timeZone,
                },  
                'attendees': [
                    {'email': data.email},
                ],
                'reminders': {
                    'useDefault': false,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
            };
                
            calendar.events.insert({
                auth: auth,
                calendarId: 'primary',
                resource: event,
            }, function(err, event) {
                if (err) {
                    console.log('There was an error contacting the Calendar service: ' + err);
                    response = {
                        "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                        "responseMessage": "There was an error contacting the Calendar service please try again"
                    }
                }
                else {
                    console.log('Event created: %s', event);
                    response = {
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "Succes save event"
                    }
                }
                resolve(response);
            });
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "There was an error contacting the Calendar service please try again"
            }
            resolve(response);
        } 
    })
}

// param = {maxResult}
exports.listEvents = function(param, auth){
    return new Promise(async function(resolve, reject){
        let response = {}
        try {
            if (!param.maxResult) {
                param.maxResult = 10;
            }
            const calendar = google.calendar({version: 'v3', auth});
            calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: param.maxResult,
                singleEvents: true,
                orderBy: 'startTime',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const events = res.data.items;
                if (events.length) {
                    console.log('Upcoming ' + param.maxResult + ' events:');
                    events.map((event, i) => {
                        const start = event.start.dateTime || event.start.date;
                        console.log(`${start} - ${event.summary}`);
                    });
                    response = {
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "Succes get event",
                        "data": events
                    }
                } else {
                    console.log('No upcoming events found.');
                    response = {
                        "responseCode": process.env.NOTFOUND_RESPONSE,
                        "responseMessage": "No upcoming events found"
                    }
                }
                resolve(response);
            });
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong with pelase try again!!"
            }
            resolve(response)
        }
    })
}

exports.geoCode = function (data) {
    return new Promise(function (resolve, reject) {
        try {
            let mapsUrl = "https://maps.googleapis.com/maps/api/geocode/json";
            let key = process.env.GOOGLE_MAPS_API_KEY;
            request.post({
                "url": mapsUrl + "?latlng=" + data.latlng + "&key=" + key,
                "timeout": 0,
            }, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                }
                console.log('geoCode ::', body)
                let result = JSON.parse(body);
                if (result.status == "OK") {
                    resolve({
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "Success get map",
                        "data": result.results
                    })    
                }
                else {
                    resolve({
                        "responseCode": process.env.NOTFOUND_RESPONSE,
                        "responseMessage": "Failed get maps"
                    })
                }
            })
        } catch (e) {
            console.log('Error checking token => ', e)
            reject({
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong please try again!!"
            });
        }
    })
}

exports.getAddressCoordinate = function (data) {
    return new Promise(function (resolve, reject) {
        try {
            let address = data.address.replace(/ /g, "+");
            let mapsUrl = "https://maps.googleapis.com/maps/api/geocode/json";
            let key = process.env.GOOGLE_MAPS_API_KEY;
            request.post({
                "url": mapsUrl + "?address=" + address + "&key=" + key,
                "timeout": 0,
            }, function (error, response, body) {
                if (error) {
                    reject(process.env.ERRORINTERNAL_RESPONSE);
                }
                console.log('getAddressCoordinate::', body)
                let result = JSON.parse(body);
                if (result.status == "OK") {
                    resolve({
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "Success get map coordinate",
                        "data": {
                            "address": result.results[0].formatted_address,
                            "lat": result.results[0].geometry.location.lat + "",
                            "long": result.results[0].geometry.location.lng + ""
                        }
                    })    
                }
                else {
                    resolve({
                        "responseCode": process.env.NOTFOUND_RESPONSE,
                        "responseMessage": "Failed get cordinate data"
                    })
                }
            })
        } catch (e) {
            console.log('Error checking token => ', e)
            reject({
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong please try again!!"
            });
        }
    })
}

exports.getAuthentiatorQr = function (data){
    return new Promise(async function(resolve){
        let secret;
        let exist = await getAuthSecret(data);
        if (exist) {
            secret = JSON.parse(exist);
        } else {
            secret = await speakeasy.generateSecret({
                name: "UltiAccess(" + data.email + "-" + data.accountCategory + ")",
            });
            data.secret = JSON.stringify(secret);
            await saveAuthSecret(data)
        }
        console.log(secret);
        qrcode.toDataURL(secret.otpauth_url, function (error, result) {
            if (error) {
                console.log("getAuthentiatorQr::", error);
                return resolve({
                    "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                    "responseMessage": "Something wrong with pelase try again!!"
                });
            }
            let response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "Success",
                "data": {
                    qrcode: result,
                }
            //   secret: secret.base32 + data.phone_code + data.phone,
            //   type: "authenticator",
            };
            resolve(response);
        });
    })
}

async function getAuthSecret (data) {
    try {
        let queryParams = {
            accountId: data.accountId,
            accountCategory: data.accountCategory,
        };
        // mongoose.Promise = global.Promise;
        // await mongoose.connect(mongoConf.mongoDb.url);
        var query = await googleAuthSchema.findOne(queryParams);
        if (query === null) {
            return false;
        } else {
            console.log("getAuthSecret: ", query)
            return query.secret;
        }
    } catch (error) {
        console.log("getAuthSecret: ", error);
        return false
    }
}

async function saveAuthSecret(data){
    // await mongoose.connect(mongoConf.mongoDb.url);
    var googleSecret = new googleAuthSchema(data);
    await googleSecret.save();
    return googleSecret;
}

exports.postGoogleAuthenticator = function (data){
    return new Promise(async function(resolve){
        let exist = await getAuthSecret(data);
        if (exist) {
            secret = JSON.parse(exist);
            let verified = speakeasy.totp.verify({
                secret: secret.base32,
                encoding: "base32",
                token: Number(data.token),
            });
            if (verified) {
                return resolve({
                    "responseCode": process.env.SUCCESS_RESPONSE,
                    "responseMessage": "Success"
                });
            } else {
                return resolve({
                    "responseCode": process.env.NOTACCEPT_RESPONSE,
                    "responseMessage": "NotAccepted"
                });
            }
        }
        else {
            return resolve({
                "responseCode": process.env.NOTFOUND_RESPONSE,
                "responseMessage": "Notfound"
            });
        }
    })
}

exports.listEmails = function(auth, param){
    return new Promise(async function(resolve, reject){
        let response = {}
        try {
            const gmail = google.gmail({version: 'v1', auth});
            gmail.users.messages.list(param, async (err, res) => {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return resolve({
                        "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                        "responseMessage": "Something wrong with pelase try again!!"
                    });
                }
                // console.log('res::', res);
                let result = [];
                const messages = res.data.messages
                console.log("message: ", messages);
                if (!messages) {
                    response = {
                        "responseCode": process.env.NOTFOUND_RESPONSE,
                        "responseMessage": "Notfound!!"
                    }
                }
                else {
                    for(let message of messages){
                        let email = await getEmailBody(gmail, message.id);
                        if (email) {
                            result.push({
                                "id": message.id,
                                "src": email.src,
                                "from": email.from
                            })
                        }
                    }
                    response = {
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "success!!",
                        "data": result
                    }
                }
                resolve(response);
            });
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong with pelase try again!!"
            }
            resolve(response);
        }
    })
}

exports.getEmail = function(auth, param){
    return new Promise(async function(resolve, reject){
        let response = {}
        try {
            const gmail = google.gmail({version: 'v1', auth});
            let email = await getEmailBody(gmail, param.id);
            response = {
                "responseCode": process.env.SUCCESS_RESPONSE,
                "responseMessage": "success!!",
                "data": email
            }
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong with pelase try again!!"
            }
        }
        resolve(response);
    })
}

function getEmailBody (gmail, id) {
    return new Promise(async function(resolve){
        try {
            gmail.users.messages.get({
                userId: 'me',
                id: id
            }, (err, res) => {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return resolve({
                        "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                        "responseMessage": "Something wrong with pelase try again!!"
                    });
                }
                let sender = res.data.payload.headers.find(obj => {
                    return obj.name === 'From'
                })
                console.log("getEmailBody: ", res.data.labelIds);
                // let mail = res.data.payload.body.data;
                try {
                    let mail = res.data.payload.parts[0].body.data;
                    if (mail) {
                        let data = {
                            src: new Buffer.from(mail, "base64").toString().replace(/\r?\n|\r/g, ''),
                            from: sender.value    
                        } 
                        // console.log("res: ", data);
                        resolve(data);
                    }
                    resolve(false)    
                } catch (error) {
                    resolve(false);
                }
            })
        } catch (error) {
            resolve(false)
        }
    })
}

exports.updateEmail = function (auth, param){
    console.log("updateEmail::", param);
    return new Promise(async function(resolve, reject){
        let response = {}
        try {
            const gmail = google.gmail({version: 'v1', auth});
            gmail.users.messages.modify(param, async (err, res) => {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    return resolve({
                        "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                        "responseMessage": "Something wrong with pelase try again!!"
                    });
                }
                console.log("modify: ", res);
                if (res.status == 200) {
                    response = {
                        "responseCode": process.env.SUCCESS_RESPONSE,
                        "responseMessage": "success!!"
                    }    
                }
                else {
                    response = {
                        "responseCode": res.status + "",
                        "responseMessage": "shometing where wrong!!"
                    }
                }
                resolve(response);
            });
        } catch (error) {
            console.log('error: ', error);
            response = {
                "responseCode": process.env.ERRORINTERNAL_RESPONSE,
                "responseMessage": "Something wrong with pelase try again!!"
            }
            resolve(response);
        }
    })
}