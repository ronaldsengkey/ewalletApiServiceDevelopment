const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;
const botSchema = require('../service/telegramBotSchema');
const helpdeskSchema = require('../service/helpdeskSchema');
const faqSchema = require('../service/faqSchema');

const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    console.log("msg::", msg);
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
    console.log("message::", msg);
    let replyMessage = "Something wrong please try again";
    const chatId = msg.chat.id;
    const name = (msg.chat.username ? msg.chat.username : (msg.chat.title ? msg.chat.title : ""));
    try {
        let param = {
            chatId: chatId
        }
        let data = {
            name: name,
            type: msg.chat.type,
            extData: JSON.stringify(msg)
        }

        let option = {
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true
        }
        let result = await botSchema.findOneAndUpdate(param, data, option);
        console.log("result::", result);
        const from = msg.from.username ? msg.from.username : msg.from.first_name;
        if (msg.text.includes('/helpme')) {
            let helpdesk = new helpdeskSchema({
                chatId: chatId,
                type: "telegram",
                text: msg.text,
                from: from,
                raw: JSON.stringify(msg)
            });
            let save = await helpdesk.save();
            if (save) {
                replyMessage = "Hi @" + from +", your message has been saved";
            }
        } else if (msg.text.includes('/hello')) {
            replyMessage = "Hi @" + from +" i am here, can i help you ?";
        } else if (msg.text.includes('/needtoknow')) {
            let faqs = await faqSchema.find({});
            console.log("faqs::", faqs);
            replyMessage = "List available topic:\n"
            if (faqs.length >= 1) {
                let index = 1;
                for(let faq of faqs){
                    replyMessage += index + ". /" + faq.topic + "\n";
                }
            } else {
                replyMessage += "Not available"
            }
        } else {
            let faqs = await faqSchema.find({
                "topic": msg.text.substring(1)
            });
            console.log("faqs::", faqs);
            if (faqs.length >= 1) {
                replyMessage = "Answer:\n"
                replyMessage += faqs[0].answer;
            } else {
                replyMessage = "Not available, list available command:\n/hello\n/helpme\n/needtoknow";
            }
        }
    } catch (error) {
        console.log("message::", error);
    }
    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, replyMessage);
});