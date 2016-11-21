"use strict";

var Grammar = require("./grammar.js");

let reservedGrammarTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "Read",
  WriteSym:   "Write",
  PlusOp:     "PlusOp",
  MinusOp:    "MinusOp",
  EOfScan:    "$",
  IntLiteral: "IntLiteral"
};

var grammar = new Grammar("grammar2.txt", reservedGrammarTokens);
//console.log("Productions:",grammar.productions);
//console.log("Terminals:",grammar.terminals);
//console.log("NonTerminals:",grammar.nonTerminals);

//grammar.fillFirstSet();
//console.log("First Set:",grammar.firstSet);

//grammar.fillFollowSet();
//console.log("Follow Set:",grammar.followSet);

//grammar.fillPredictSet();
//console.log("Predict Set:",grammar.predictSet);

grammar.fillParseTable();
console.log("Parse Table:",grammar.parseTable);
console.log("Finished.");
