"use strict";

var log = require('winston');
var SymbolTable = require("./symbolTable.js");
var types = require("./types.js");

/*
 * A class to build out semantic rules as output instructions.
 * ECMAScript 6 (NodeJS v6.5.0)
 * !!! Still a work in progress. :-)
 * Stephen Taylor, University of Colorado Denver
 * staylorx@gmail.com
 */

class Semantic {

  //Sets the readable stream so the scanner can work on it.
  //The "Start" semantic routine is equivalent to the instantiation
  //of the Symantic class.
  //IN:  consoleFlag is a boolean that determines if the generate will
  //     print to console or stdout. Defaults to false.
  constructor(consoleFlag = false ) {
    log.debug("Constructing semantic...");
    
    this.currentToken = "";  
    this.nextToken = "";  
    this.consoleFlag = consoleFlag; 
    this.codeLines = [];
    
    this.symbolTable = new SymbolTable();
    this.maxTemp = 0;
    
  }

  //Generate an instruction for the machine
  //IN:  an array of arguments
  //OUT: s is a string instruction
  generate(...args) /*: string */ {
    if (args.length < 1 || args.length > 4) {
      throw "Argument count must be between 1 and 4.";
    }
    let s = "";
    s = args[0];
    if (args.length > 1) {
      s += " " + args.slice(1).join(",");
    }
    
    if (this.consoleFlag) {
      //"write" the generation out
      console.log(s);
    }
    
    //return it too so it can be tested easily
    return s;
  }
  
  
  checkId(symbol /*: string */) {
    if (!this.symbolTable.lookup(symbol)) {
      //didn't find the symbol in the lookup table...
      //generate an instruction for it then
      this.symbolTable.enter(symbol);
      let code = this.generate("Declare",symbol,"Integer");
      this.codeLines.push(code);
      return code;
    }
  }
  
  getTemp() /*: string */{
    this.maxTemp++;
    var tempName = "Temp&" + this.maxTemp;
    this.checkId(tempName);
    return tempName;
  }
  
  extract(e /*:typeof types.ExpressionRecord*/) {
    switch (e.kind) {
      case (types.ExpressionKind.ID_EXPR || types.ExpressionKind.TEMP_EXPR):
        return e.name;
      case (types.ExpressionKind.LITERAL_EXPR):
        return e.val;
    }
  }

  extractOp(o /*:typeof types.OperatorRecord*/) {
    if (o.kind === types.OperatorKind.PLUS_OP) {
      return "ADD ";
    } else {
      return "SUB ";
    }
  }
  
  //Generates the assign
  //OUT: returns the string generated
  assign(targetexpressionRecord /*:typeof types.ExpressionRecord*/, sourceexpressionRecord /*:typeof types.ExpressionRecord*/) /*: string */ {
    let code = this.generate("Store",this.extract(sourceexpressionRecord),targetexpressionRecord.name);
    this.codeLines.push(code);
    return code;
  }

  //Generates the read
  //OUT: returns the string generated
  readId(inVar /*: string */) /*: string */{
    let code =  this.generate("Read",inVar.name,"Integer");
    this.codeLines.push(code);
    return code;
  }

  //Generates the write
  //OUT: returns the string generated
  writeExpr(outExpr /*:typeof types.ExpressionRecord*/) {
    let code = this.generate("Write",this.extract(outExpr),"Integer");
    this.codeLines.push(code);
    return code;
  }
  
  //OUT: returns an exprRec
  genInfix(e1 /*:typeof types.ExpressionRecord*/,op /*:typeof types.OperatorRecord*/,e2 /*:typeof types.ExpressionRecord*/)  /*: types.expressionRecord */{
    var exprRec = new types.ExpressionRecord(types.ExpressionKind.TEMP_EXPR);
    exprRec.name = this.getTemp();
    let code = this.generate(this.extractOp(op),this.extract(e1), this.extract(e2), exprRec.name);
    this.codeLines.push(code);
    return exprRec;
  }

  processId(name) {
    this.checkId(name);
    return new types.ExpressionRecord("Id",types.ExpressionKind.ID_EXPR,name);
  }
  
  processLiteral(value) {
    return new types.ExpressionRecord("IntLiteral",types.ExpressionKind.LITERAL_EXPR,parseInt(value,10));
  }
  
  //OUT: OperatorRecord
  processOp(token) {
    if (token === "PlusOp") {
      return new types.OperatorRecord(types.OperatorKind.PLUS_OP);      
    } else {
      return new types.OperatorRecord(types.OperatorKind.MINUS_OP);      
    }
  }
  
  finish() /*: string */ {
    let code = this.generate("Halt");
    this.codeLines.push(code);
    return code;
  }

}

module.exports = Semantic;