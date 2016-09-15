"use strict";

var log = require('winston');
var Scanner = require("./scanner.js");
var Semantic = require("./semantic.js");
var Readable = require('stream').Readable;

log.level = "verbose";

/*
 * A class to parse tokens from the scanner.
 * Checks for syntactic correctness.
 * Throws an error on syntax failure.
 * Otherwise exists quietly on success.
 *
 * ECMAScript 6 (NodeJS v6.5.0)
 * Homework #2
 * 03-SEP-2016
 * Stephen Taylor, University of Colorado Denver
 * staylorx@gmail.com
 */
class Parser {

  //Sets the readable stream so the scanner can work on it.
  //IN:  readableInput is either a Readable or a {S,s}tring
  //IN:  an object of valid tokens
  constructor(readableInput, validTokens) {
    
    this.validTokens = validTokens;
    this.currentToken = "";
    this.nextToken = "";
    this.totalOutput = [];

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
    this.semantic = new Semantic(true);
    
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
  
  //Output the process in a readable way
  hwOutput(call/*: string */) {
    let input = this.tokenArrayString();
    log.verbose(pad(call,32),pad(input,64,true));
    var o = {call:call, input:input, code:this.semantic.codeLines.join('\n')};
    this.totalOutput.push(o);
  }
  
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
  
  //The main method of the class, that starts the parsing process.
  parse() {
    
    this.hwOutput("Call SystemGoal");    
    this.systemGoal();
    
    return this.parseSuccess;
  }

  //Grammar statement  
  systemGoal() {
    this.hwOutput("Call Program");    
    this.program();

    this.match("EofSym");

    this.semantic.finish();
    this.hwOutput("Call Finish");     
  }
  
  //Grammar statement  
  program() {
    //the procedure "Start" is implied in the creation of the Semantic object.
    this.hwOutput("Call Start");     
    
    this.match("BeginSym");
    
    this.hwOutput("Call StatementList");     
    this.statementList();
    
    this.match("EndSym");
  }
  
  //Grammar statement  
  statementList() {
    this.hwOutput("Call Statement");
    this.statement();
    
    switch (this.nextToken) {
      case "Id":
        this.hwOutput("Call StatementList");         
        this.statementList();
        break;
      case "ReadSym":
        this.hwOutput("Call StatementList");         
        this.statementList();
        break;
      case "WriteSym":
        this.hwOutput("Call StatementList");         
        this.statementList();
        break;
      default:
        return;
    }
  }
  
  //Grammar statement  
  statement(expressionLevel = 1) {
    
    switch (this.nextToken) {
      case "Id":
        this.hwOutput("Call Ident");         
        let identifier = this.ident();
   
        this.match("AssignOp");
   
        let expressionLevel = 1;
        this.hwOutput("Call Expression["+(expressionLevel + 1)+"]");         
        let expr = this.expression(expressionLevel + 1);
   
        this.match("SemiColon");
        
        this.semantic.assign(identifier,expr);
        this.hwOutput("Call Expression["+expressionLevel+"]");         
        
        break;
      case "ReadSym":
        this.match("ReadSym");
   
        this.match("LParen");
   
        this.hwOutput("Call IdList");         
        this.idList();
   
        this.match("RParen");
   
        this.match("SemiColon");
        break;
      case "WriteSym":
        this.match("WriteSym");
   
        this.match("LParen");
   
        this.hwOutput("Call ExpressionList");         
        this.expressionList();
   
        this.match("RParen");
   
        this.match("SemiColon");
        break;
      default:
        this.syntaxError("Fallthrough on 'statement'. No operation found for " + this.nextToken);
    }
  }
  
  //Grammar statement  
  idList() {
    this.hwOutput("Call Ident");
    var result = this.ident();
   
    //call readId with whatever is in the scanner expression record
    this.semantic.readId(this.scanner.expressionRecord);
    this.hwOutput("ReadId");
    
    if (this.nextToken === "Comma") {
      this.match("Comma");
   
      this.hwOutput("Call IdList");       
      this.idList();
   
    } else {
      return;
    }
  }
  
  //Grammar statement  
  expressionList() {
    this.hwOutput("Call Expression");
    this.expression();
    
    if (this.nextToken === "Comma") {
      
      this.match("Comma");
      
      this.hwOutput("Call ExpressionList");       
      this.expressionList();
      
    } else {
      return;
    }
  }
  
  //Grammar statement  
  expression(expressionLevel = 1) {
    this.hwOutput("Call Primary");     
    
    let leftOperand = this.primary();

    if (this.nextToken === "PlusOp" || this.nextToken === "MinusOp") {

      this.hwOutput("Call AddOp");     

      let op = this.addOp();

      this.hwOutput("Call Expression["+(expressionLevel + 1) +"]");
      let rightOperand = this.expression(expressionLevel + 1);
      this.hwOutput("Return from Expression["+(expressionLevel + 1) +"]");     

      return this.semantic.genInfix(leftOperand, op, rightOperand);
    } else {
      return leftOperand;
    }

  }
  
  //Grammar statement  
  primary(expressionLevel = 1) {
    var result;
    switch(this.nextToken) {
      case "LParen":

        this.match("LParen");

        this.hwOutput("Call Expression["+(expressionLevel + 1) +"]");
        result = this.expression(expressionLevel + 1);
        this.hwOutput("Return from Expression["+(expressionLevel + 1) +"]");     

        this.match("RParen");

        break;
      case "Id":
        
        this.hwOutput("Call Ident");
        result = this.ident();

        break;
      case "IntLiteral":
        
        this.match("IntLiteral");
        result = this.semantic.processLiteral(this.scanner.readToken);

        break;
      default:
        this.syntaxError("Fallthrough on 'primary'. No operation found for " + this.nextToken);
    }
    return result;
  }
  
  //Grammar statement  
  ident() {
    
    this.match("Id");

    let result = this.semantic.processId(this.scanner.readToken);
    this.hwOutput("Call ProcessId");
    
    return result;

  }
  
  //Grammar statement  
  addOp() {
    var result;
    switch(this.nextToken) {
      case "PlusOp":
        
        this.match("PlusOp");
        result = this.semantic.processOp("PlusOp");
        this.hwOutput("Call ProcessOp");
      
        break;
      case "MinusOp":
        
        this.match("MinusOp");
        result = this.semantic.processOp("MinusOp");
        this.hwOutput("Call ProcessOp");

        break;
      default:
        this.syntaxError("Fallthrough on 'primary'. No operation found for " + this.nextToken);
    }
    return result;
  }

}

//thank you, http://stackoverflow.com/questions/2686855/is-there-a-javascript-function-that-can-pad-a-string-to-get-to-a-determined-leng
function pad(str, len, padLeft = false) {
  //create string of len spaces long
  let pad = Array(len).join(' ');
  if (typeof str === 'undefined') { 
    return pad;
  }
  if (padLeft) {
    return (pad + str).slice(-pad.length);
  } else {
    return (str + pad).substring(0, pad.length);
  }
}

module.exports = Parser;