"use strict";

var log = require('winston');
var Grammar = require("./grammar.js");

log.level = "debug";

var grammar = new Grammar("grammar1.txt");
console.log(grammar.productions);
console.log(grammar.parseTable);
log.info("Finished.");
