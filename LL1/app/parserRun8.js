"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #8
//01-NOV-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var Parser = require('../app/parser.js');

var hwFunc = function(programString) {
  
  let parser = new Parser(programString, reservedGrammarTokens, reservedCodeTokens, "grammar.txt");
  parser.LLDriver();
  let outLines = [];
  outLines.push("Program Input:" + programString + "\n");
  outLines.push("Compiler Output:");
  outLines.push.apply(outLines, parser.semantic.codeLines);
  outLines.push("==========================================");
  outLines.push("Assignment Output:");
  outLines.push.apply(outLines, parser.hw8Lines);
  console.log(outLines.join("\n"));

};

var reservedCodeTokens = {
  BeginSym:   "BEGIN",
  EndSym:     "END",
  ReadSym:    "READ",
  WriteSym:   "WRITE",
  EOfScan:    "$"
};

//grammar tokens include the IntLiteral which in grammar is a kind of Id. Fun.
var reservedGrammarTokens = {
  IntLiteral: "IntLiteral",
  PlusOp:     "PlusOp",
  MinusOp:    "MinusOp",
  BeginSym:   "BEGIN",
  EndSym:     "END",
  ReadSym:    "READ",
  WriteSym:   "WRITE",
  EOfScan:    "$"
};

var programStrings = [];

//////////////////
programStrings[1] = `
BEGIN --SOMETHING UNUSUAL
  READ(A1, New_A, D, B);
  C:= A1 +(New_A - D) - 75;
  New_C:=((B - (7)+(C+D))) - (3 - A1); -- STUPID FORMULA
  WRITE (C, A1+New_C);
  -- WHAT ABOUT := B+D;
END $
`;

//////////////////
//Modified this from asst #1 since there was a LHS grammar violation
programStrings[2] = `
BEGIN
  READ(OPT, A, B); 
  READ(OPT, C, D); 
  Q_VAR_01 := (A+C)-(B-D);
  VAR_SPREAD:= 1234 + 3456 +
    --forgot to keep this on one line
    7894 -(A+B);
  WRITE(A, 75894589349); 
  
END --Phew, finally done.
$
`;

//////////////////
programStrings[3] = "BEGIN A := BB + 314 + A; END $";

let arg = 0;
if (process.argv[2] > 0 && process.argv[2] < 4) {
  arg = process.argv[2];  
} else {
  console.log("The number must be 1, 2, or 3");
  return;
}
hwFunc(programStrings[arg]);

console.log("Finished");

