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
  constructor() {
    log.debug("Constructing semantic...");
    
    this._currentToken = "";
    this._nextToken = "";
    
    //so I feel like I'm really "starting".
    this.start();
    
  }

  //Starts the process of semantic matching
  //by reseting the symbol table and temp counter
  start() {
    this._symbolTable = new SymbolTable();
    this._maxTemp = 0;
  }

  _generate(...args) {
    if (args.length < 1 || args.length > 4) {
      throw "Argument count must be between 1 and 4.";
    }
    let s = args[0];
    if (args.length > 1) {
      s += " " + args.slice(1).join(",");
    }
    //"write" the generation out
    console.log(s);
    //return it too so it can be tested easily
    return s;
  }
  
  checkId(symbol) {
    if (!this._symbolTable.lookup(symbol)) {
      this._symbolTable.enter(symbol);
      return this._generate("Declare",symbol,"Integer");
    }
  }
  
  _getTemp() {
    this._maxTemp++;
    var tempName = "Temp&" + this._maxTemp;
    this.checkId(tempName);
    return tempName;
  }
  
  _extract(e) {
    switch (e.kind) {
      case (types.expressionKind.ID_EXPR || types.expressionKind.TEMP_EXPR):
        return e.name;
      case (types.expressionKind.LITERAL_EXPR):
        return e.val;
    }
  }

  _extractOp(o) {
    if (o.Op === types.operator.PLUS_OP) {
      return "ADD ";
    } else {
      return "SUB ";
    }
  }
  
  //Generates the assign
  //OUT: returns the string generated
  assign(targetexpressionRecord,sourceexpressionRecord) {
    return this._generate("Store",this._extract(sourceexpressionRecord),targetexpressionRecord.name);
  }

  //Generates the read
  //OUT: returns the string generated
  readId(inVar) {
    return this._generate("Read",inVar.name,"Integer");
  }

  //Generates the write
  //OUT: returns the string generated
  writeExpr(outExpr) {
    return this._generate("Write",this._extract(outExpr),"Integer");
  }
  
  //OUT: returns an exprRec
  genInfix(e1,op,e2) {
    var exprRec = new types.expressionRecord(types.types.expressionKind.TEMP_EXPR);
    exprRec.name = this._getTemp();
    this._generate(this._extractOp(op),this._extract(e1), this._extract(e2), exprRec.name);
    return exprRec;
  }

  processId(e) {
    log.debug("processId: ",e);
    this.checkId(e.name);
  }
  
  processLiteral(e) {
    log.debug("processLiteral: ",e);
  }
  
  _processOp(o) {
    log.debug("processOp: ",o);
    o.op = this._currentToken;
  }
  
  finish() {
    return this._generate("Halt");
  }

}


module.exports = Semantic;