var request = require('request');
var gpio = require('rpi-gpio');
var async = require('async');
var mailer = require('./config/node-mailer.js');
var logger = require('./simple-logger.js');

var lastMailSent = 0;

function start() {
    async.series([
            function(callback) {
                logger.log("#####################################");
                logger.log("######## Monitor started! :) ########");
                logger.log("#####################################");
                callback();
            },
            // set up pin for single read
            function(callback) {
                gpio.setup(7, gpio.DIR_IN, callback);
            },
            // read current door state and log it with doorChange()
            function(callback) {
                gpio.read(7, function(err, value) {
                    doorChange(value);
                    callback();
                });
            },
            // reset all pins
            function(callback) {
                gpio.destroy(callback);
            },
            // instead of single read, start listening for changes
            function(callback) {
                gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH);
                gpio.on('change', function(channel, value) {
                    doorChange(value);
                });
            }
        ],
        function(err, results) {
            logger.log("#####################################");
            logger.log("######## Monitor stopped! :( ########");
            logger.log("########    Did you sudo?    ########");
            logger.log("#####################################");
        }
    );
}

function doorChange(value, callback) {
    // but only send an email if door is open
    if (value === true) {
        if (lastMailSent < (Date.now() - 10000)) {
            //			sendPost(value);
            sendMail("Door opened");
        } else {
            logger.log("Already sent email");
        }
    } else {
        logger.log("Door closed");
    }
}

function sendMail(text) {
    lastMailSent = Date.now();
    var mailOptions = {
        from: 'Pi Door Monitor <verstegen.daan@gmail.com', // sender address
        to: 'verstegen.daan@gmail.com', // list of receivers
        subject: 'Door activity', // Subject line
        text: text // plaintext body
    };
    mailer.transporter.sendMail(mailOptions, function(err, info) {
        if (err) return console.error(err);
        logger.log(info.response);
    });
}

// Send a post request to the server containing the data
function sendPost(value) {
    var url = 'http://192.168.0.100:3000/doors/postData/';
    url += Date.now();
    url += "/";
    url += value;
    request.post(url, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            logger.log("Server response: " + body);
        } else {
            logger.log(err);
        }
    });
}

start();
