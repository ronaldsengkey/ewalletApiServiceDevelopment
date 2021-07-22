'use strict';
require('dotenv').config();
var mongoose = require('mongoose').set('debug', true);
var mongoConf = require('./config/mongo.js');
var fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    cluster = require('cluster'),
    bodyParser = require('body-parser'),
    numCPUs = require('os').cpus().length,
    helmet = require('helmet'),
    http = require('http');

// var app = require('connect')();
var oas3Tools = require('oas3-tools');
var jsyaml = require('js-yaml');
const fastify = require('fastify')({
  logger: {
    prettyPrint: true 
  }
})
var serverPort = process.env.PORT_APP;
fastify.use(bodyParser.json());
fastify.use(morgan('dev'));

const io = require('socket.io')(fastify.server);
const message = require('./models/messageM');
const marray = require('./config/array');
const checkSignature = require('./middleware/signature');

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
oas3Tools.initializeMiddleware(swaggerDoc, function (middleware) {

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  fastify.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  fastify.use(middleware.swaggerValidator());

  fastify.use(checkSignature);

  // Route validated requests to appropriate controller
  fastify.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  fastify.use(middleware.swaggerUi());

  fastify.use(helmet())
  
  const amqp = require('amqplib') // Import library amqp
  // const { execSync } = require("child_process");

   if(cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);
    console.log('master cluster setting up '+numCPUs+' workers')
  
    // Fork workers.
    for (let i = 0; i < 1; i++) {
      cluster.fork();
    }

    cluster.on('online',function(worker, code, signal){
      // console.log('Worker ' + worker.process.pid + ' is online');
    })

    //Check if work is died
    cluster.on('exit', (worker, code, signal) => {
      console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      console.log('Starting a new worker');
      cluster.fork();
    });

  }else{

    let worker = cluster.worker.id;
  // Start the server
    const start = async () => {
      try {
        mongoose.connect(mongoConf.mongoDb.url, {
          useNewUrlParser: true
        }).then(function (e) {
          console.log("MONGO CONNECTED");
        });
        let telegramBot = require('./config/telegramBot');
        console.log("telegramBot::", telegramBot);
        // const slackBot = require('./config/slackBot');
        // slackBot.listenForEvents(fastify);
        // console.log("slackBot::", slackBot);
        // const socketUsers = {};
        const clients = {};
        const account = {};
        // const socket = require('./socket');
        // await socket.openSocket();
        // ============================= SOCKET IO ===============================
        await fastify.listen(serverPort, '0.0.0.0');
        fastify.log.info();
      } catch (err) {
        console.log(err)
        fastify.log.error(err)
        process.exit(1)
      }
    }
    start()
  }

});
