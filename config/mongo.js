require('dotenv').config();

// const mongoUrl = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;
const mongoUrl = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`;
const options = {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
    // server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
    // replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};

module.exports = {
    mongoDb: {
        url: mongoUrl,
        options: options
    }
};