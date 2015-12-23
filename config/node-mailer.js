var nodemailer = require('nodemailer');
var authData = require('./authData.js');

var mailer = module.exports = {};

mailer.transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
	        user: authData.username,
	        pass: authData.password
	    }
});
