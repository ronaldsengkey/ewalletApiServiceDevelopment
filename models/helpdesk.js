'use strict';
const helpdeskSchema = require('../service/helpdeskSchema');

exports.getHelpdesk = async function(data = {
    type: "",
    from: "",
    text: ""
}){
    return new Promise(async function(resolve){
        try {
            let param = {};
            if (data.type) {
                param.type = data.type;
            }
            if (data.from) {
                param.from = data.from;
            }
            if (data.text) {
                param.text = { 
                    $regex: data.text, 
                    $options: 'i' 
                }
            }
            let result = await helpdeskSchema.find(param);
            return result;
        } catch (error) {
            console.log("error::", error);
            return resolve(false)
        }
    })
}