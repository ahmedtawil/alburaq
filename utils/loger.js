// create a rolling file logger based on date/time that fires process events
const opts = {
	errorEventName:'error',
        logDirectory:'./mylogfiles', // NOTE: folder must exist and be writable...
        fileNamePattern:'mylogfile.log',
        dateFormat:'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger( opts );
module.exports = log