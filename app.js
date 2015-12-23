console.log("it works! :)");

var gpio = require('rpi-gpio');
var mailer = require('./config/node-mailer.js');

gpio.on('change', function(channel, value) {
	console.log('Channel ' + channel + ' value is now ' + value);
	doorChange(value);
});

gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH);

function doorChange(value) {
	console.log("door open = " + value);
//	sendMail("door open = " + value);
}

function sendMail(text) {
	var mailOptions = {
		from: 'node-mailer <verstegen.daan@gmail.com', // sender address
		to: 'verstegen.daan@gmail.com', // list of receivers
		subject: 'Sup bruh!', // Subject line
		text: text // plaintext body
	};
	mailer.transporter.sendMail(mailOptions, function(err, info) {
		if (err) return console.error(err);
		console.log(info.response);
	});
}
