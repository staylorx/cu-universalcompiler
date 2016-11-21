"use strict";

var Scanner = require('./scanner.js');

var reservedCodeTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  EOfScan:    "$"
};

var reservedGrammarTokens = {
  IntLiteral: "IntLiteral",
  PlusOp:     "PlusOp",
  MinusOp:    "MinusOp",
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  EOfScan:    "$"
};

let programString;
let scanner;

programString = "begin A := BB + 314 + A; end $";
scanner = new Scanner(programString,reservedCodeTokens);
let s = scanner.tokensAsString(true);
console.log("1:",s);

scanner = new Scanner(s,reservedCodeTokens);
console.log("2:",scanner.tokensAsString());

// programString = "<statement>-> write(<expr list>) ;";
// scanner = new Scanner(programString,reservedGrammarTokens);
// console.log(scanner.tokensAsString());

// programString = "<add op>    -> PlusOp #ProcessOp($$)";
// scanner = new Scanner(programString,reservedGrammarTokens);
// console.log(scanner.tokensAsString());

console.log("Finished.");



