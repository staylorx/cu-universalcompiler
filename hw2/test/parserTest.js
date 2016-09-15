"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #2
//07-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Parser = require('../app/parser.js');
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

describe('Parser Tests', function(){

  it('Testing the Parser, example from the assignment.', function(){
    let programString = `begin A := BB + 314 + A; end`;
    log.info("========== HW#2, Program #1:\n",programString);
    var parser = new Parser(programString, ValidTokens);
    try {
      parser.parse();
      assert(true,"Parsing completed successfully.");
    } catch(err) {
      assert(false,"Parsing failed: " + err);
    }
  });

  xit('Testing the with something from my examples.', function(){
    let programString = `
        begin
          read(OPT, A, B); 
          read(OPT, C, D); 
          Q_VAR_01 := (A+C)-(B-D);
          VAR_SPREAD:= 1234 + 3456 +
            --forgot to keep this on one line
            7894 -(A+B);
          write(A, 75894589349); 
          
        end --Phew, finally done.
        `;
    log.info("========== HW#2, Something larger to test:\n",programString);
    var parser = new Parser(programString, ValidTokens);
    try {
      parser.parse();
      assert(true,"Parsing completed successfully.");
    } catch(err) {
      assert(false,"Parsing failed: " + err);
    }
  });

});
