"use strict";

var Grammar = require("./grammar.js");
var Scanner = require("./scanner.js");
var Semantic = require("./semantic.js");
var Readable = require('stream').Readable;
var winston = require('winston');

//default logger
var log = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        level: "info",
        colorize: true,
        timestamp: false
      })
    ]
  });

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
    this.tokenArray = []; //used for homework output
    this.tokenArrayLength;
    this.hw8Lines = [];
    this.hw9Lines = [];

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
    //the true argument normalizes the original input so it can
    //be reused.
    let tokenString = this.scanner.tokensAsString(true);
    this.tokenArray = tokenString.split(" ");
    this.tokenArrayLength = this.tokenArray.join(' ').length + 1;
    
    // //read again to reset the scanner
    this.scanner = new Scanner(tokenString, this.validCodeTokens);
    
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
    this.hw9Lines.push('Entry into the main loop "while not"');
    this.hw9Lines.push("Input:" + currentToken);
    this.hw9Lines.push("PS:" + this.getPrettyPrintParseStack(true));
    this.hw9Lines.push("SS:" + this.semantic.stack.stackToString());
    this.hw9Lines.push("Indices:" + this.semantic.stack.pointersToString());
    this.hw9Lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    this.hw8Lines.push("|" + pad("PREDICT",11)+"|"+pad('INPUT CODE',this.tokenArrayLength)+"|"+"PARSE STACK");

    while (this.parseStack.length !== 0 ) {
      
      //let X be the top stack symbol; 
      let X = this.parseStack[this.parseStack.length-1];
      
      //let a be the current input token
      let a = currentToken;
      
      if (this.grammar.nonTerminals.has(X)) {
        
        this.hw8Lines.push("|" + pad("Predict " + this.grammar.T(X,a),11) + "|" +  pad(this.tokenArray.join(' '),this.tokenArrayLength) + "|" + this.getPrettyPrintParseStack(false) );
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
          this.parseStack.pop();

          //push EOP on the parse stack
          let eop = this.semantic.stack.pushEOP([...P.RHSActions]);
          this.parseStack.push(eop);

          for (let i = 0; i < reverseY.length; i++) {
            this.parseStack.push(reverseY[i]);
          }

          this.hw9Lines.push('T(' + P.LHS + ',' + a + ') = ' + this.grammar.T(X,a));
          this.hw9Lines.push("Input:" + this.tokenArray.join(' '));
          this.hw9Lines.push("PS:" +this.getPrettyPrintParseStack(true));
          this.hw9Lines.push("SS:" +this.semantic.stack.stackToString());
          this.hw9Lines.push("Indices:" + this.semantic.stack.pointersToString());
          this.hw9Lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

        } else {
          this.syntaxError("[Parser][NonTerminal] LLDriver T(X,a) is undefined, T("+JSON.stringify(X)+","+a+")");
        }
        
      } else if (this.grammar.terminals.has(X)) {   

        log.debug ("[Parser][Terminal] X=",X);

        if (X === a) {
        
          this.tokenArray.shift();
          this.hw8Lines.push("|" + pad("Match",11) + "|" + pad(this.tokenArray.join(' '),this.tokenArrayLength) + "|" + this.getPrettyPrintParseStack(false)   );

          //Copy token info from scanner into SS[currentIndex]
          this.semantic.stack.setToken(this.scanner.tokenBuffer);
          
          this.parseStack.pop();

          //Get next token    
          currentToken = this.scanner.scan();

          this.hw9Lines.push('X = ' + X);
          this.hw9Lines.push("Input:" + this.tokenArray.join(' '));
          this.hw9Lines.push("PS:" + this.getPrettyPrintParseStack(true));
          this.hw9Lines.push("SS:" + this.semantic.stack.stackToString());
          this.hw9Lines.push("Indices:" + this.semantic.stack.pointersToString());
          this.hw9Lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

        } else {
          this.syntaxError("[Parser][Terminal] LLDriver: Cannot work with terminal "+X);
        } //end if;   
        
      } else if (X.eop) {
        
        this.semantic.stack.popEOP(X);
        this.parseStack.pop();

        this.hw9Lines.push('X = EOP(' + X.leftIndex + "," + X.rightIndex + "," + X.currentIndex + "," + X.topIndex + ")");
        this.hw9Lines.push("Input:" + this.tokenArray.join(' '));
        this.hw9Lines.push("PS:" + this.getPrettyPrintParseStack(true));
        this.hw9Lines.push("SS:" + this.semantic.stack.stackToString());
        this.hw9Lines.push("Indices:" + this.semantic.stack.pointersToString());
        this.hw9Lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

      } else if (X.indexOf("#") === 0) {

        this.parseStack.pop();

        //grab the action code        
        let funktion = X.match(/^#\w*/g);
        funktion = funktion[0].slice(1);

        //get the SS positions
        let argsMatch = X.match(/\$./g);
        
        //convert the $$ to 0, $1 to 1, $2 to 2, etc.
        if (argsMatch) {
          for (let i = 0; i < argsMatch.length; i++) {
            if (argsMatch[i].slice(1)=="$") {
              argsMatch[i] = 0;
            } else {
              argsMatch[i] = parseInt(argsMatch[i].slice(1),10);
            }
          }
        }
        
        //call semantic routine for X
        switch (funktion) {
          case "Start":
            this.semantic.Start();
            break;
          case "ProcessId":
            this.semantic.ProcessId();
            break;
          case "ProcessLiteral":
            this.semantic.ProcessLiteral();
            break;
          case "ProcessOp":
            this.semantic.ProcessOp();
            break;
          case "Finish":
            this.semantic.Finish();
            break;
          case "Copy":
            this.semantic.Copy(argsMatch[0],argsMatch[1]);
            break;
          case "Assign":
            this.semantic.Assign(argsMatch[0],argsMatch[1]);
            break;
          case "ReadId":
            this.semantic.ReadId(argsMatch[0]);
            break;
          case "WriteExpr":
            this.semantic.WriteExpr(argsMatch[0]);
            break;
          case "GenInfix":
            this.semantic.GenInfix(argsMatch[0],argsMatch[1],argsMatch[2],argsMatch[3]);
            break;
          default:
            throw "Can't figure out action symbol for " + X;
        }

        this.hw9Lines.push('X = ' + X);
        this.hw9Lines.push("Input:" + this.tokenArray.join(' '));
        this.hw9Lines.push("PS:" + this.getPrettyPrintParseStack(true));
        this.hw9Lines.push("SS:" +  this.semantic.stack.stackToString());
        this.hw9Lines.push("Indices:" + this.semantic.stack.pointersToString());
        this.hw9Lines.push('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        
      } //end if; 
    } //end while 
    
    this.tokenArray.shift();
    this.hw8Lines.push("|" + pad("Done",11) + "|" + pad(this.tokenArray.join(' '),this.tokenArrayLength) + "|" + this.getPrettyPrintParseStack(false));

  } //end LLDriver 

  getPrettyPrintParseStack(complexStack) {
    //NOTE: This reverses the array so the stack "reads" cleanly.
    //copy the stack/array
    let newArray = this.parseStack.slice().reverse();
    
    let s = "";
    for (let X of newArray) {
      if (X.eop) {
        if (complexStack) {
          s += "EOP(" + X.leftIndex + "," + X.rightIndex + "," + X.currentIndex + "," + X.topIndex + ") ";
        }
      } else if (X.indexOf("#") === 0) {
        if (complexStack) {
          s += X + " ";
        }
      } else {
        s += X + " ";
      }
    }
    return s;
  }

  /*
   * Doesn't do much but log an error.
   * IN:  message is a string to display in the log.
   */
  syntaxError(message) {
    log.error("[Parser] Syntax Error:",message + "\n" + this.tokenArray.join(' '));
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