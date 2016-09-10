
var types = require('./types.js');
var ExpressionRecord = require('./types.js').ExpressionRecord;
var OperatorRecord = require('./types.js').OperatorRecord;
var log = require('winston');
log.level = "verbose";

var expr1 = new ExpressionRecord("TestSym", types.ExpressionKind.TEMP_EXPR, 12);

console.log(expr1);