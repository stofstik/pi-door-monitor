// TODO add express and listen for a request for door data, then return with
// json...

var gpio   = require('rpi-gpio');
var async  = require('async');
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
			logger.log("#####################################");
        }
    );
}

function doorChange(value, callback) {
    if (value === true) {
        logger.log("Door opened");
        if (lastMailSent < (Date.now() - 10000)) {
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
	// TODO send post req to server
    mailer.transporter.sendMail(mailOptions, function(err, info) {
        if (err) return console.error(err);
        logger.log(info.response);
    });
}

start();
