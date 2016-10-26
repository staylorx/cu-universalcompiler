"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #3
//18-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var fs = require('fs');
var Parser = require('../app/parser.js');
var stringTable = require("string-table");
var log = require('winston');
log.level = "debug";

//made this configurable because with each assignment these change slightly
var ValidTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  Id:         "ID",
  IntLiteral: "INT",
  LParen:     "(",
  RParen:     ")",
  SemiColon:  ";",
  Comma:      ",",
  AssignOp:   ":=",
  PlusOp:     "+",
  MinusOp:    "-",
  EofSym:     "$"
};

//let programString = `begin read (IN); OUT:= IN+100+1; write(OUT); end $ `;
let programString = `begin A := BB + 314 + A; end $`;
var parser = new Parser(programString, ValidTokens, "grammar1.txt");
console.log(parser.tokenArrayString());

console.log("Finished");