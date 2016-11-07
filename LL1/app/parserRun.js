"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #3
//18-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var Parser = require('../app/parser.js');
var log = require('winston');
log.level = "verbose";

//made this configurable because with each assignment these change slightly
let ValidTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  EndOfSym:   "$"
};

//let programString = `begin read (IN); OUT:= IN+100+1; write(OUT); end $ `;
let programString = "begin A := BB + 314 + A; end $";
var parser = new Parser(programString, ValidTokens, "grammar1.txt");
parser.LLDriver();

console.log("Output for HW8");
for (let line of parser.w8) {
  console.log(line);
}

//console.log("Output for HW9");
//for (let line of parser.w9) {
//  console.log(line);
//}

console.log("Finished");