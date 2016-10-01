"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Unit tests from back in HW2, but included for HW4
//28-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Scanner = require('../app/scanner.js');
var log = require('winston');
log.level = "verbose";

describe('Scanner Tests as strings', function(){

  it('From HW#1, listing #1 involved scan.', function(){
    let programString = `
        BEGIN --SOMETHING UNUSUAL
          READ(A1, New_A, D, B);
          C:= A1 +(New_A - D) - 75;
          New_C:=((B - (7)+(C+D))) - (3 - A1); -- STUPID FORMULA
          WRITE (C, A1+New_C);
          -- WHAT ABOUT := B+D;
        END
        `;
    log.info("========== Program #1.1 listing:\n",programString);
    let scanner = new Scanner(programString);
    let tokenString = scanner.tokensAsString();
    log.info("========== Program #1.1 tokens:\n",tokenString);
    assert(tokenString === "BeginSym ReadSym LParen Id Comma Id Comma Id Comma Id RParen SemiColon Id AssignOp Id PlusOp LParen Id MinusOp Id RParen MinusOp IntLiteral SemiColon Id AssignOp LParen LParen Id MinusOp LParen IntLiteral RParen PlusOp LParen Id PlusOp Id RParen RParen RParen MinusOp LParen IntLiteral MinusOp Id RParen SemiColon WriteSym LParen Id Comma Id PlusOp Id RParen SemiColon EndSym EofSym");
  });
  
  it('From HW#1, listing #2, involved scan.', function(){
    let programString = `
        BEGIN
          READ(OPT, A, B); 
          READ(OPT, C, D); 
          Q_VAR_01 + 1 := (A+C)-(B-D);
          VAR_SPREAD:= 1234 + 3456 +
            --forgot to keep this on one line
            7894 -(A+B);
          WRITE(A, 75894589349); 
          
        END --Phew, finally done.
        `;
    log.info("========== Program #1.2 listing:\n",programString);
    let scanner = new Scanner(programString);
    let tokenString = scanner.tokensAsString();
    log.info("========== Program #1.2 tokens:\n",tokenString);
    assert(tokenString === "BeginSym ReadSym LParen Id Comma Id Comma Id RParen SemiColon ReadSym LParen Id Comma Id Comma Id RParen SemiColon Id PlusOp IntLiteral AssignOp LParen Id PlusOp Id RParen MinusOp LParen Id MinusOp Id RParen SemiColon Id AssignOp IntLiteral PlusOp IntLiteral PlusOp IntLiteral MinusOp LParen Id PlusOp Id RParen SemiColon WriteSym LParen Id Comma IntLiteral RParen SemiColon EndSym EofSym");
  });
  
  it('From HW#2, parser input.', function(){
    let programString = `BEGIN A := B +(72 - C); END`;
    log.info("========== Homework #2, scanner listing:\n",programString);
    let scanner = new Scanner(programString);
    let tokenString = scanner.tokensAsString();
    log.info("========== Homework #2, scanner tokens:\n",tokenString);
    assert(tokenString === "BeginSym Id AssignOp Id PlusOp LParen IntLiteral MinusOp Id RParen SemiColon EndSym EofSym");
  });

});
