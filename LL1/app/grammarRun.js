"use strict";

var log = require('winston');
var Grammar = require("./grammar.js");

log.level = "debug";

var grammar = new Grammar("grammar1.txt");
console.log("Productions:",grammar.productions);
console.log("Parse Table:",grammar.parseTable);
console.log("T(<primary tail>,;)=:",grammar.T("<primary tail>",";"));
log.info("Finished.");
