"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Old Scanner for HW #4
//Code from 25-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Scanner = require('../app/oldScanner.js');
var log = require('winston');
log.level = "verbose";

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
  EqualOp:    "=",
  ExpnOp:     "**",
  EofSym:     "EOF"
};

describe('Scanner Tests as strings', function(){

  it('For HW#4, Something new.', function(){
    let programString = `
        BEGIN --SOMETHING NEW
          X:= 15;
          A:= 3141 + X - 75;
        END
        `;
    log.info("========== Program #4.2.a listing:\n",programString);
    let scanner = new Scanner(programString, ValidTokens);
    let tokenString = scanner.tokensAsString();
    log.info("========== Program #4.2.a tokens:\n",tokenString);
    assert(tokenString === "BeginSym Id AssignOp IntLiteral SemiColon Id AssignOp IntLiteral PlusOp Id MinusOp IntLiteral SemiColon EndSym EofSym");
  });
  
  it('From HW#4, another new thing', function(){
    let programString = `
        BEGIN
          READ(OPT, A, B); 
          READ(OPT, C, D); 
          WRITE(A, 75894589349); 
        END
        `;
    log.info("========== Program #4.2.b listing:\n",programString);
    let scanner = new Scanner(programString, ValidTokens);
    let tokenString = scanner.tokensAsString();
    log.info("========== Program #4.2.b tokens:\n",tokenString);
    assert(tokenString === "BeginSym ReadSym LParen Id Comma Id Comma Id RParen SemiColon ReadSym LParen Id Comma Id Comma Id RParen SemiColon WriteSym LParen Id Comma IntLiteral RParen SemiColon EndSym EofSym");
  });
  
});
