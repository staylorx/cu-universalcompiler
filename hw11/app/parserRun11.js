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
log.level = "info";

//made this configurable because with each assignment these change slightly
var ValidTokens = {
  BeginSym:   "BEGIN",
  EndSym:     "END",
  ReadSym:    "READ",
  WriteSym:   "WRITE",
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

let programString = `BEGIN A === BB + 314 + A; END`;
var parser = new Parser(programString, ValidTokens);
parser.parse();

var w = fs.createWriteStream('../out/hw11-x.txt');
w.write("Input:\n")
w.write(programString + "\n");
w.write("\nDetailed Output:\n")
w.write(stringTable.create(parser.totalOutput,{ headerSeparator: '*', rowSeparator: '~' }));
w.end();
