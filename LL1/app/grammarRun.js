"use strict";

var log = require('winston');
var Grammar = require("./grammar.js");

log.level = "debug";

let reservedTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "Read",
  WriteSym:   "Write",
  EOfScan:    "$",
  IntLiteral: "IntLiteral"
};

var grammar = new Grammar("grammar1.txt", reservedTokens);
console.log("Productions:",grammar.productions);
//console.log("Terminals:",grammar.terminals);
//console.log("First Set:",grammar.firstSet);
//console.log("Follow Set:",grammar.followSet);
//console.log("Predict Set:",grammar.predictSet);
//console.log("Parse Table:",grammar.parseTable);
//console.log("T(<primary tail>,;)=:",grammar.T("<primary tail>","SemiColon"));
log.info("Finished.");
