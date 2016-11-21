/*
 * 
 * Helpful routine to build out log files  for homework assignments.
 *
 */

var winston = require('winston');
var fs = require('fs');

var logDir = "./logs";
if ( !fs.existsSync( logDir ) ) {
	fs.mkdirSync( logDir );
}

//helpful to ensure the folder exists
var fileHW8 = logDir + "/HW8.txt";
//slick the HW9.log file everytime
if ( fs.existsSync( fileHW8 ) ) {
  fs.truncateSync(fileHW8,0);
}

var logHW8 = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ 
          level: "info",
          filename: fileHW8,
          timestamp: false,
          json: false,
          maxsize: 1024 * 1024 * 10, // 10MB
          maxFiles: 1
      })
    ]
  });

//helpful to ensure the folder exists
var fileHW9 = logDir + "/HW9.txt";
//slick the HW9.log file everytime
if ( fs.existsSync( fileHW9 ) ) {
  fs.truncateSync(fileHW9,0);
}

var logHW9 = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ 
          level: "info",
          filename: fileHW9,
          timestamp: false,
          json: false,
          maxsize: 1024 * 1024 * 10, // 10MB
          maxFiles: 1
      })
    ]
  });


// winston.addColors({
//     info: 'green',
//     warn: 'cyan',
//     error: 'red',
//     verbose: 'blue',
// });

module.exports = { logHW8, logHW9 };