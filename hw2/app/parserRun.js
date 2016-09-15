"use strict";

var Parser = require('../app/parser.js');
var stringTable = require("string-table");

var log = require('winston');
log.level = "verbose";

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

let programString = `begin A := BB + 314 + A; end`;
log.info("========== HW#2, Program #1:\n",programString);
var parser = new Parser(programString, ValidTokens);
parser.parse();
console.log(stringTable.create(parser.totalOutput,{ headerSeparator: '*', rowSeparator: '~' }));
log.info("Finished.");