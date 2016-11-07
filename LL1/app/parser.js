"use strict";

var fs = require('fs');
var log = require('winston');
var Grammar = require("./grammar.js");
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
    this.totalOutput = [];
    this.semantic = new Semantic(true);
    this.w8 = [];
    this.w9 = [];

    if (grammarFile === undefined) {
      throw "Parser: A grammar file is required.";
    }    
    if (validTokens === undefined) {
      throw "Parser: A set of valid tokens must be provided";
    }
    
    //grammar tokens include the IntLiteral which in grammar
    //is a kind of Id. Fun.
    let grammarTokens = {
      BeginSym:   "begin",
      EndSym:     "end",
      ReadSym:    "Read",
      WriteSym:   "Write",
      EndOfSym:    "$",
      IntLiteral: "IntLiteral"
    };
    this.grammar = new Grammar(grammarFile, grammarTokens);

    //test for string or Readable
    let readable;
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
    
    this.scanner = new Scanner(readable, this.validTokens);
    
    //let's get this party started, prime
    this.scanFeed();

    //this.semantic = new Semantic(true);
    
  }
  
  /*
   * Helper method , useful to keep a pair of these since I can't peek ahead.
   */
  scanFeed() {
    this.currentToken = this.nextToken;
    this.nextToken = this.scanner.scan();
    log.debug("currentToken=",this.currentToken,"; nextToken=",this.nextToken);
  }

  LLDriver() {
    
    //Push the Start Symbol onto an empty stack  
    //the semanticstack is managed in the symantic object...
    //it's already started
    this.parseStack.push("<system goal>"); 
    this.scanFeed();

    this.w8.push ("|" + pad("PREDICT",11)+"|"+pad("TOKEN",24)+"|"+"PARSE STACK");

    while (this.parseStack.length !== 0 ) {
      
      //let X be the top stack symbol; 
      let X = this.parseStack[0];
      
      //let a be the current input buffer
      //TODO lots of impedence between the buffer, symbol, the token.
      let a = this.currentToken;
      
      this.w9.push("X: " + X + "\n" + "PS: " + this.parseStack + "\n" + "SS: " + this.semantic.stack.toString() + "\n");
      
      if (this.grammar.nonTerminals.has(X)) {
        
        this.w8.push("|" + pad("Predict " + this.grammar.T(X,a),11) + "|" +  pad(a + " " + this.nextToken + " ...",24) + "|" + this.parseStack.join(" ")          );
        
        if (this.grammar.T(X,a) !== undefined) {
          
          //Expand nonterminal, replace X with Y1Y2. . . Ym on the stack. 
          this.parseStack.shift();
          
          //lookup the production by the predict #
          let P = this.grammar.productions[this.grammar.T(X,a)];
          
          let reverseY;
          //Lambda is a magic word and has to be handled.
          if (P.RHS.indexOf('Lambda') > -1) {
            reverseY = [];
          } else {
            //Begin with Ym, then Ym-1, . . . , and Y1 will be on top of the stack.     
            reverseY = [...P.RHS].reverse();
          }
          
          for (let i = 0; i < reverseY.length; i++) {
            this.parseStack.unshift(reverseY[i]);
          }

          let eop = this.semantic.stack.pushEOP([...P.RHS]);
          this.parseStack.unshift(eop);

        } else {
          this.syntaxError("LLDriver: Cannot work with nonTerminal",X);
        }
        
      } else if (this.grammar.terminals.has(X)) {   
        
        if (X === a) {
          //Match of X worked     
          
          this.w8.push("|" + 
            pad("Match",11) + 
            "|" + 
            pad(a + " " + this.nextToken + " ...",24) + 
            "|" + 
            this.parseStack.join(" ")  
          );
        
          this.semantic.stack.pushToken(a);
          this.parseStack.shift();
          //Get next token    
          this.scanFeed();
        
        } else {
          this.syntaxError("LLDriver: Cannot work with terminal",X);
        } //end if;   
        
      } else if (X.eop) {
        
        this.semantic.stack.popEOP(X);
        this.parseStack.shift();
      
      } else if (X.action) {

        this.parseStack.shift();
        //TODO call semantic routine for X
        
      } //end if; 
    } //end while 
    
    this.w8.push ("|" + pad("Done",11) + "|" + pad(" ",24) + "|" + this.parseStack.join(" "));

  } //end LLDriver 

  /*
   * Doesn't do much but log an error.
   * IN:  message is a string to display in the log.
   */
  syntaxError(message) {
    log.error("Syntax Error:",message);
    throw message;
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