"use strict";

var fs = require('fs');
var log = require('winston');
var Grammar = require("./grammar.js");
var Scanner = require("./scanner.js");
var Semantic = require("./semantic.js");
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
  constructor(readableInput, validGrammarTokens, validCodeTokens, grammarFile) {
    
    this.validGrammarTokens = validGrammarTokens;
    this.validCodeTokens = validCodeTokens;
    this.totalOutput = [];
    this.consoleFlag = true;
    this.parseStack = [];
    this.totalOutput = [];
    this.semantic = new Semantic(true);
    this.w8 = [];
    this.w9 = [];

    if (grammarFile === undefined) {
      throw "[Parser] A grammar file is required.";
    }    
    if (validGrammarTokens === undefined) {
      throw "[Parser] A set of valid grammar tokens must be provided";
    }
    if (validCodeTokens === undefined) {
      throw "[Parser] A set of valid code tokens must be provided";
    }
    
    this.grammar = new Grammar(grammarFile, validGrammarTokens);
    this.grammar.fillParseTable();

    //test for string or Readable
    let readable;
    if (typeof(readableInput) == 'string' || readableInput instanceof String) {
      readable = new Readable();
      readable.push(readableInput);
      readable.push(null);
    } else if (readableInput instanceof Readable) {
      readable = readableInput;
    } else if (readableInput === null || readableInput === undefined) {
      log.error("[Parser] Empty argument. Requires a string or Readable.");
      return;
    } else {
      log.error("[Parser] No suitable input to parse.");
      return;
    }
    
    log.verbose("[Parser] Creating scanner for code.");
    this.scanner = new Scanner(readable, this.validCodeTokens);
    
    // //need to do this for the homework. nothing else
    // this.tokenString = this.scanner.tokensAsString();
    
    // //read again to reset the scanner
    // this.scanner = new Scanner(this.tokenString, this.validCodeTokens);
    
    //this.semantic = new Semantic(true);
    
    log.verbose("##############################");
    log.verbose("#");
    log.verbose("# Parser has been constructed.");
    log.verbose("#");
    log.verbose("##############################");

  }
  
  LLDriver() {
    
    //Push the Start Symbol onto an empty stack  
    //the semanticstack is managed in the symantic object...
    //it's already started with the system goal
    
    this.parseStack.push("<system goal>"); 
    let currentToken = this.scanner.scan();
    log.info('[Parser][HW9] Entry into the main loop "while not"');
    log.info("[Parser][HW9] Input:", currentToken);
    log.info("[Parser][HW9] PS:", this.getPrettyPrintParseStack());
    log.info("[Parser][HW9] SS:", this.semantic.stack.stackToString());
    log.info("[Parser][HW9] Indices:", this.semantic.stack.pointersToString());
    log.info('[Parser][HW9] ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    // this.w8.push ("|" + pad("PREDICT",11)+"|"+pad("TOKEN",24)+"|"+"PARSE STACK");

    while (this.parseStack.length !== 0 ) {
      
      //let X be the top stack symbol; 
      let X = this.parseStack[0];
      
      //let a be the current input buffer
      //TODO lots of impedence between the buffer, symbol, the token.
      let a = currentToken;
      
      this.w9.push("X: " + JSON.stringify(X) + "\n" + "PS: " + JSON.stringify(this.parseStack) + "\n" + "SS: " + JSON.stringify(this.semantic.stack.toString()) + "\n");
      
      if (this.grammar.nonTerminals.has(X)) {
        
        this.w8.push("|" + pad("Predict " + this.grammar.T(X,a),11) + "|" +  pad(a + " " + this.nextToken + " ...",24) + "|" + this.parseStack.join(" ")          );
        log.debug("--------------------");
        log.debug ("[Parser][NonTerminal] X=",X);
        
        if (this.grammar.T(X,a) !== undefined) {

          //lookup the production by the predict #
          let P = this.grammar.productions[this.grammar.T(X,a)];
          
          //Push Ym ... Y1 on the parse stack
          let reverseY;
          //Lambda is a magic word and has to be handled.
          if (P.RHSActions.indexOf('Lambda') > -1) {
            reverseY = [];
          } else {
            //Begin with Ym, then Ym-1, . . . , and Y1 will be on top of the stack.     
            reverseY = [...P.RHSActions].reverse();
          }

          //Pop X from the parse stack
          //Expand nonterminal, replace X with Y1Y2. . . Ym on the stack. 
          this.parseStack.shift();

          //push EOP on the parse stack
          let eop = this.semantic.stack.pushEOP([...P.RHSActions]);
          this.parseStack.unshift(eop);

          for (let i = 0; i < reverseY.length; i++) {
            this.parseStack.unshift(reverseY[i]);
          }

          log.info('[Parser][NonTerminal][HW9] T(' + P.LHS + ',' + a + ') = ' + this.grammar.T(X,a));
          log.info("[Parser][NonTerminal][HW9] Input:", currentToken);
          log.info("[Parser][NonTerminal][HW9] PS:", this.getPrettyPrintParseStack());
          log.info("[Parser][NonTerminal][HW9] SS:", this.semantic.stack.stackToString());
          log.info("[Parser][NonTerminal][HW9] Indices:", this.semantic.stack.pointersToString());
          log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

        } else {
          this.syntaxError("[Parser][NonTerminal] LLDriver T(X,a) is undefined, T(",JSON.stringify(X),",",a,")");
        }
        
      } else if (this.grammar.terminals.has(X)) {   

        log.debug("--------------------");
        log.debug ("[Parser][Terminal] X=",X);

        if (X === a) {
        
          // this.w8.push("|" + 
          //   pad("Match",11) + 
          //   "|" + 
          //   pad(a + " " + this.nextToken + " ...",24) + 
          //   "|" + 
          //   this.parseStack.join(" ")  
          // );

          //Copy token info from scanner into SS[currentIndex]
          this.semantic.stack.setToken(this.scanner.tokenBuffer);
          
          this.parseStack.shift();

          //Get next token    
          currentToken = this.scanner.scan();

          log.info('[Parser][Terminal][HW9] X = ' + X);
          log.info("[Parser][Terminal][HW9] Input:", currentToken);
          log.info("[Parser][Terminal][HW9] PS:", this.getPrettyPrintParseStack());
          log.info("[Parser][Terminal][HW9] SS:", this.semantic.stack.stackToString());
          log.info("[Parser][Terminal][HW9] Indices:", this.semantic.stack.pointersToString());
          log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

        } else {
          this.syntaxError("[Parser][Terminal] LLDriver: Cannot work with terminal",X);
        } //end if;   
        
      } else if (X.eop) {
        
        this.semantic.stack.popEOP(X);
        this.parseStack.shift();

        log.info('[Parser][EOP][HW9] X = ' + X);
        log.info("[Parser][EOP][HW9] Input:", currentToken);
        log.info("[Parser][EOP][HW9] PS:", this.getPrettyPrintParseStack());
        log.info("[Parser][EOP][HW9] SS:", this.semantic.stack.stackToString());
        log.info("[Parser][EOP][HW9] Indices:", this.semantic.stack.pointersToString());
        log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

      } else if (X.indexOf("#") === 0) {

        this.parseStack.shift();
        //TODO call semantic routine for X

        log.info('[Parser][Action][HW9] X = ' + X);
        log.info("[Parser][Action][HW9] Input:", currentToken);
        log.info("[Parser][Action][HW9] PS:", this.getPrettyPrintParseStack());
        log.info("[Parser][Action][HW9] SS:", this.semantic.stack.stackToString());
        log.info("[Parser][Action][HW9] Indices:", this.semantic.stack.pointersToString());
        log.info('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        
      } //end if; 
    } //end while 
    
    // this.w8.push ("|" + pad("Done",11) + "|" + pad(" ",24) + "|" + this.parseStack.join(" "));

  } //end LLDriver 

  getPrettyPrintParseStack() {
    let s = "";
    for (let X of this.parseStack) {
      if (!X.eop) {
        s += X + " ";
      } else if (X.eop) {
        s += "EOP(" + X.leftIndex + "," + X.rightIndex + "," + X.currentIndex + "," + X.topIndex + ") ";
      } else {
        s += "BOGUS! ";
      }
    }
    return s;
  }

  /*
   * Doesn't do much but log an error.
   * IN:  message is a string to display in the log.
   */
  syntaxError(message) {
    log.error("[Parser] Syntax Error:",message);
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