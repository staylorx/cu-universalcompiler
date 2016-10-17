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
  constructor(readableInput, validTokens, grammarFile) {
    
    this.validTokens = validTokens;
    this.currentToken = "";
    this.nextToken = "";
    this.totalOutput = [];
    this.consoleFlag = true;

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
  
  genActions(symbolSet) {
    //generate actions necessary to match x 
    if (symbolSet.size === 0) {
      this.generate("null"); 
    } else {
      for (const s of symbolSet) {
        if (this.grammar.terminals.has(s)) {        
          this.generate("    Match(",this.makeId(s),");" );
        } else {
          this.generate("    ",this.makeId(s),";");
        }
      }
    }
  }
  
  generate(...args) /*: string */ {
    let s = args.join(" ");

    if (this.consoleFlag) {
      //"write" the generation out
      console.log(s);
    }
    
    //return it too so it can be tested easily
    return s;
  }

  makeId(s /*: string */) {
    
    let self = this;

    //just about maxed out on my want-to-know about js objects now.    
    Object.getOwnPropertyNames(self.validTokens).forEach(function(val, idx, array) {
      if (self.validTokens[val] === s) {
        s = val;          
      }
    });
    
    //should fall through if it's not a token...
    //check to see if it's a nonterm form
    //Propercase the nonterminal with no spaces
    let result = "";
    if (s.match(/[\w ]+/g)) {
      //strip the <> chars
      let tempS = s.replace(/[<>]/g,"");
      //split on space
      let split = tempS.split(" ");
      for (let x of split) {
        result += x.charAt(0).toUpperCase() + x.slice(1);
      }
      s = result;
    }
    
    return s;
  }
  
  makeParsingProc(A) {
    //LL1 table from grammar.productions
    let firstId;
    this.generate("procedure", this.makeId(A), "is"); 
    this.generate("begin"); 
    this.generate("  case NextToken is"); 
    
    for (const P of this.grammar.getProductions(A) ) {
      this.generate("    when");  
      firstId = true; 
      
      log.debug("parseTable = ",this.grammar.parseTable);
      for (const xMap of this.grammar.parseTable) {
        log.debug("Parser:",xMap);
        //make sure we're at the correct non-Terminal
        if (xMap[0] === P.LHS) {
          //run through all the parse states
          for (const x of xMap[1]) {
            log.debug("Looking for x",x,"in xMap[1]",xMap[1]);
            
            //find the one that matches this production
            if (x[1] === P.productionNumber) {
              if (firstId) {
                this.generate("    ",this.makeId(x[0]));
                firstId = false; 
              } else {
                this.generate("    ","|", this.makeId(x[0]));
              }
            }
          }
        }        
      } //for each terminal
      
      this.generate("    ","=>"); 
      this.genActions(P.RHS);
      
    } //for each production
    
    this.generate("    when others => SyntaxError(NextToken);"); 
    this.generate("  end case;"); 
    this.generate("end",this.makeId(A),";");
    this.generate("");

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
  
    //TODO a thing? Maybe run through nonTerms?
    for (const A of this.grammar.nonTerminals) {
      this.makeParsingProc(A);
    }
    
    return this.parseSuccess;
    
  }

}

module.exports = Parser;