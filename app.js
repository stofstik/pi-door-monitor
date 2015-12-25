var gpio = require('rpi-gpio');
var moment = require('moment');
var async = require('async');
var mailer = require('./config/node-mailer.js');

var lastMailSent = 0;

log("#####################################");
log("######## Monitor started! :) ########");
log("#####################################");

function start() {
    async.series([
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
			// destroy all
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
			log("#####################################");
			log("######## Monitor stopped! :( ########");
			log("#####################################");
        }
    );
}

function doorChange(value, callback) {
    if (value === true) {
        log("Door opened");
        if (lastMailSent < (Date.now() - 10000)) {
            sendMail("Door opened");
        } else {
            log("Already sent email");
        }
    } else {
        log("Door closed");
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
        log(info.response);
    });
}

function log(text) {
    console.log(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + " " + text);
}

start();
