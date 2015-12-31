// TODO log to web dashboard

var moment = require('moment');

var logger = module.exports = {};

var dateFormat = "YYYY-MM-DD HH:mm:ss";

logger.log = function(text) {
	console.log(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + " " + text);
};
