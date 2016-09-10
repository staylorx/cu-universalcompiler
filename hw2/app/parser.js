"use strict";

var log = require('winston');
var Scanner = require("./scanner.js");
var Semantic = require("./semantic.js");
var Readable = require('stream').Readable;
log.level = "verbose";
// @flow

/*
 * A class to parse tokens from the scanner.
 * Checks for syntactic correctness.
 *
 * ECMAScript 6 (NodeJS v6.5.0)
 * Homework #2
 * 30-AUG-2016
 * Stephen Taylor, University of Colorado Denver
 * staylorx@gmail.com
 */
class Parser {

  //Sets the readable stream so the scanner can work on it.
  //IN:  readableInput is either a Readable or a {S,s}tring
  constructor(readableInput) {
    
    log.debug("Constructing parser...");
    
    this._readable;
    this._currentToken = "";
    this._nextToken = "";

    //test for string or Readable
    if (typeof(readableInput) == 'string' || readableInput instanceof String) {
      this._readable = new Readable();
      this._readable.push(readableInput);
      this._readable.push(null);
    } else if (readableInput instanceof Readable) {
      this._readable = readableInput;
    } else if (readableInput === null || readableInput === undefined) {
      log.error("Empty argument. Requires a string or Readable.");
      return;
    } else {
      log.error("No suitable input to parse.");
      return;
    }
    
    //bit of a guess but if we're this far we've got a readable to use.
    this._scanner = new Scanner(this._readable);
    this._scanFeed();  //let's get this party started
    this._semantic = new Semantic();
  }

  /*
   * Helper method , useful to keep a pair of these since I can't peek ahead.
   */
  _scanFeed() {
    this._currentToken = this._nextToken;
    this._nextToken = this._scanner.scan();
  }

  /*
   * Call scanFeed to move the pointers along.
   * Then checks the currentToken against what's legal.
   * If it matches, then moves along quietly, 
   * otherwise calls "syntaxError"
   * IN:  legalToken is a string and the token to be checked.
   */
  match(legalToken) {
    //get a token off the scanner
    log.debug ("Match(",legalToken,") called...");
    this._scanFeed();
    if (this._currentToken !== legalToken) {
      let message = "Expecting '" + legalToken + "', found '" + this._currentToken + "'.";
      this._syntaxError(message);
    }
    log.debug ("Match(",legalToken,") called... and matched!");
  }
  
  /*
   * Doesn't do much but log an error.
   * IN:  message is a string to display in the log.
   */
  _syntaxError(message) {
    log.error("Syntax Error:",message);
    throw message;
  }
  
  /*
   * Helper method to check the token object for legal tokens.
   * IN:  checkToken, a string to be looked up in the object.
   * OUT: the token as string if it is in the table,
   *      otherwise return undefined.
   */
  _checkSymbol(checkToken) {
    for (let token in TOKENS) {
      if (token == this.match(checkToken)) {
        return token;
      }
    }
    return undefined;
  }
  
  /*
   * The main method of the class, that starts the parsing process.
   */
  parse() {
    if (this._readable === undefined) {
      log.error("No Readable: Cannot find stream for the scanner to work against.");
      return;
    }
    log.verbose("<system goal>");
    this._systemGoal();
    return this._parseSuccess;
  }
  
  _systemGoal() {
    log.verbose("14 -> <program>$");
    this._program();
    this.match("EofSym");
    this._semantic.finish();
  }
  
  _program() {
    log.verbose("1  -> begin <statementList> end$");
    this._semantic.start();
    this.match("BeginSym");
    this._statementList();
    this.match("EndSym");
  }
  
  _statementList() {
    log.verbose("2  -> Id :=<statement> ;");
    this._statement();
    switch (this._nextToken) {
      case "Id":
        log.verbose("2  -> Id := <statementList> ;");
        this._statementList();
        break;
      case "ReadSym":
        log.verbose("2  -> Id := <statementList> ;");
        this._statementList();
        break;
      case "WriteSym":
        log.verbose("2  -> Id := <statementList> ;");
        this._statementList();
        break;
      default:
        return;
    }
  }
  
  _statement() {
    switch (this._nextToken) {
      case "Id":
        log.verbose("3  -> Id :=<expression> ;");
        this._ident();
        this.match("AssignOp");
        this._expression();
        this.match("SemiColon");
        //this._semantic.assign(targetexpressionRecord,sourceexpressionRecord);
        break;
      case "ReadSym":
        log.verbose("4  -> read(<idList>) ;");
        this.match("ReadSym");
        this.match("LParen");
        this._idList();
        this.match("RParen");
        this.match("SemiColon");
        break;
      case "WriteSym":
        log.verbose("5  -> write(<idList>) ;");
        this.match("WriteSym");
        this.match("LParen");
        this._expressionList();
        this.match("RParen");
        this.match("SemiColon");
        break;
      default:
        this._syntaxError("Fallthrough on 'statement'. No operation found for " + this._nextToken);
    }
  }
  
  _idList() {
    log.verbose("6  -> Id ;");
    this._ident();
    this._semantic.readId();
    if (this._nextToken === "Comma") {
      this._match("Comma");
      this._idList();
    } else {
      return;
    }
  }
  
  _expressionList() {
    log.verbose("7  -> <expr list> ;");
    this._expression();
    if (this._nextToken === "Comma") {
      this._match("Comma");
      this._expressionList();
    } else {
      return;
    }
  }
  
  _expression() {
    log.verbose("8  -> <expression>");
    this._primary();
    if (this._nextToken === "PlusOp" || this._nextToken === "MinusOp") {
      log.verbose("8  -> <primary><add op><expression>");
      this._addOp();
      this._expression();
    } else {
      return;
    }
  }
  
  _primary() {
    switch(this._nextToken) {
      case "LParen":
        log.verbose("9  -> (<expression>)");
        this.match("LParen");
        this._expression();
        this.match("RParen");
        break;
      case "Id":
        log.verbose("9  -> Id");
        this._ident();
        break;
      case "IntLiteral":
        log.verbose("9  -> IntLiteral");
        this.match("IntLiteral");
        break;
      default:
        this._syntaxError("Fallthrough on 'primary'. No operation found for " + this._nextToken);
    }
  }
  
  _ident() {
    this.match("Id");
    log.info("!!!" + this._currentToken);
    //this._semantic.processId(???);
  }
  
  _addOp() {
    switch(this._nextToken) {
      case "PlusOp":
        log.verbose("12 -> PlusOp");
        this.match("PlusOp");
        break;
      case "MinusOp":
        log.verbose("12 -> MinusOp");
        this.match("MinusOp");
        break;
      default:
        this._syntaxError("Fallthrough on 'primary'. No operation found for " + this._nextToken);
    }
  }

}

//An enumeration (of sorts) to hold the tokens.
var TOKENS = {
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
  EofSym:     "EOF",
};

module.exports = Parser;