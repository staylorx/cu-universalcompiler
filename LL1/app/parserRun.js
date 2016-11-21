"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #3
//18-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var Parser = require('../app/parser.js');

var reservedCodeTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  EOfScan:    "$"
};

//grammar tokens include the IntLiteral which in grammar is a kind of Id. Fun.
var reservedGrammarTokens = {
  IntLiteral: "IntLiteral",
  PlusOp:     "PlusOp",
  MinusOp:    "MinusOp",
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "Read",
  WriteSym:   "Write",
  EOfScan:    "$"
};

var programString

// programString = "begin A := BB + 314 + A; end $";

// programString = `
//   begin
//     A := 5;
//     B := A -2;
//     C := 1 - (A + B);
//   end $`;

programString = `begin read (IN); OUT:= IN+100+1; write(OUT); end $ `;

var parser = new Parser(programString, reservedGrammarTokens, reservedCodeTokens, "grammar.txt");
parser.LLDriver();

console.log("Program input:",programString);
console.log("Tuple output: ")
for (let line of parser.semantic.codeLines) {
  console.log(line);
}

console.log("Finished");