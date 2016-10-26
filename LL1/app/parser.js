"use strict";

var log = require('winston');
var Grammar = require("./grammar.js");
var Scanner = require("./scanner.js");
var Readable = require('stream').Readable;

log.level = "debug";

/*
 * A class to parse tokens from the scanner.
 * Checks for syntactic correctness.
 * Throws an error on syntax failure.
 * Otherwise exists quietly on success.
 *
 * !The grammar class and the parser class
 * are very tightly coupled right now.
 *
 * ECMAScript 6 (NodeJS v6.5.0)
 * Homework #8
 * 24-OCT-2016
 * Stephen Taylor, University of Colorado Denver
 * staylorx@gmail.com
 */
class Parser {

  //Sets the readable stream so the scanner can work on it.
  //IN:  readableInput is either a Readable or a {S,s}tring
  //IN:  an object of valid tokens
  constructor(readableInput, validTokens, grammarFile) {
    
    this.validTokens = validTokens;
    this.currentToken = "";
    this.nextToken = "";
    this.totalOutput = [];
    this.consoleFlag = true;
    this.parseStack = [];

    if (grammarFile === undefined) {
      throw "Parser: A grammar file is required.";
    }    
    this.grammar = new Grammar(grammarFile);

    if (validTokens === undefined) {
      throw "Parser: A set of valid tokens must be provided";
    }
    
    //test for string or Readable
    let readable
    if (typeof(readableInput) == 'string' || readableInput instanceof String) {
      readable = new Readable();
      readable.push(readableInput);
      readable.push(null);
    } else if (readableInput instanceof Readable) {
      this.readable = readableInput;
    } else if (readableInput === null || readableInput === undefined) {
      log.error("Empty argument. Requires a string or Readable.");
      return;
    } else {
      log.error("No suitable input to parse.");
      return;
    }
    
    //dump out the tokens into an array.
    //used for the homework output
    this.scanner = new Scanner(readable, this.validTokens);
    this.tokenArray = [];
    let token;
    while ((token = this.scanner.scan()) !== "EofSym") {
      this.tokenArray.push(this.scanner.tokenBuffer);
    }

    log.debug("Starting the process with normalized:");

    //reload the scanner since we ate up the stream
    this.scanner = new Scanner(this.tokenArrayString(), this.validTokens);
    this.scanFeed();  //let's get this party started
    //this.semantic = new Semantic(true);
    
    //this is for the formatted output... it was left off to init the scanner.
    //it's put back on to be pretty.
    this.tokenArray.push("EofSym");

  }
  
  //helper to normalize the tokenbuffer items
  tokenArrayString() /* : string */ {
    return this.tokenArray.join(" ");
  }
  
  /*
   * Helper method , useful to keep a pair of these since I can't peek ahead.
   */
  scanFeed() {
    this.currentToken = this.nextToken;
    this.nextToken = this.scanner.scan();
    log.debug("currentToken=",this.currentToken,"; nextToken=",this.nextToken);
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
    this.scanFeed();
    if (this.currentToken !== legalToken) {
      let message = "Expecting '" + legalToken + "', found '" + this.currentToken + "'.";
      this.syntaxError(message);
    }
    this.tokenArray.shift();
    this.hwOutput("Call Match(" + legalToken + ")");    
    log.debug ("Match(",legalToken,") called... and matched!");
  }
  
  LLDriver() {
    //Push the Start Symbol onto an empty stack  
    this.parseStack.push("<system goal>"); 
    while (this.parseStack.length !== 0) {
      //let X be the top stack symbol; 
      let X = this.parseStack[0];
      //let a be the current input token   
      let a = this.currentToken;
      if (X in this.grammar.nonTerminals) {
        
        if (this.grammar.T(X, a) === "X —> Y1Y2. . . Ym") {
          //Expand nonterminal, replace X with Y1Y2. . . Ym on the stack. 
          //Begin with Ym, then Ym-1, . . . , and Y1 will be on top of the stack.     
        } else {
          //process syntax error   
        }
        
      } else if (X in this.grammar.terminals) {    
        if (X === a) {
          //Match of X worked     
          this.parseStack.pop(1);
          //Get next token    
          this.scan();
        } else {
          this.SyntaxError("what what?");
        } //end if;   
      } //end if; 
    } //end while 
  } //end LLDriver 

  /*
   * Doesn't do much but log an error.
   * IN:  message is a string to display in the log.
   */
  syntaxError(message) {
    log.error("Syntax Error:",message);
    throw message;
  }
  
  /*
   * Helper method to check the token object for legal tokens.
   * IN:  checkToken, a string to be looked up in the object.
   * OUT: the token as string if it is in the table,
   *      otherwise return undefined.
   */
  checkSymbol(checkToken) {
    for (let token in this.validTokens) {
      if (token == this.match(checkToken)) {
        return token;
      }
    }
    return undefined;
  }

}

module.exports = Parser;