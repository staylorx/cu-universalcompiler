"use strict";

var SymbolTable = require("./symbolTable.js");
var types = require("./lib/types.js");
var SemanticStack = require("./semanticStack.js");
var log = require('winston');

/*
 * A class to build out semantic rules as output instructions.
 * ECMAScript 6 (NodeJS v6.5.0)
 * 01-NOV-2016
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
    log.debug("[Semantic] Constructing semantic...");
    
    this.currentToken = "";  
    this.nextToken = "";  
    this.consoleFlag = consoleFlag; 

    this.symbolTable = new SymbolTable();
    this.maxTemp = 0;
    
    //semantic stack starts with the start symbol
    this.stack = new SemanticStack('<system goal>');
    this.codeLines = [];

  }

  //Generate an instruction for the machine
  //IN:  an array of arguments
  //OUT: s is a string instruction
  generate(...args) /*: string */ {
    if (args.length < 1 || args.length > 4) {
      throw "[Semantic] Argument count must be between 1 and 4.";
    }
    let s = "";
    s += "(" + args.join(",") + ")";
 
    this.codeLines.push(s);
    
    //return it too so it can be tested easily
    return s;
  }
  
  checkId(symbol /*: string */) {
    if (!this.symbolTable.lookup(symbol)) {
      //didn't find the symbol in the lookup table...
      //generate an instruction for it then
      this.symbolTable.enter(symbol);
      //let code = this.generate("DECL",symbol,"Integer");
      //return code;
    }
  }
  
  getTemp() /*: string */{
    this.maxTemp++;
    var tempName = "Temp&" + this.maxTemp;
    this.checkId(tempName);
    return tempName;
  }
  
  extractExpr(e /*:typeof types.ExpressionRecord*/) {
    switch (e.kind) {
      case (types.ExpressionKind.ID_EXPR):
        return "Addr(" + e.name + ")";
      case (types.ExpressionKind.TEMP_EXPR):
        return e.name;
      case (types.ExpressionKind.LITERAL_EXPR):
        return e.val;
      default:
        return e;
    }
  }

  extractOp(o /*:typeof types.OperatorRecord*/) {
    if (o.kind === types.OperatorKind.PLUS_OP) {
      return "ADDI";
    } else {
      return "SUBI";
    }
  }

  //Generates the assign
  //OUT: returns the string generated
  Assign(target, source) /*: string */ {
    let targetPos = this.getArrayPosition(target);
    let targetRec = this.stack.stack[targetPos];
    let sourcePos = this.getArrayPosition(source);
    let sourceRec = this.stack.stack[sourcePos];
    let code = this.generate("ASSIGN",this.extractExpr(sourceRec),"Addr(" + targetRec.name + ")");
    return code;
  }

  //Generates the read
  //OUT: returns the string generated
  ReadId(inVar) /*: string */{
    let inPos = this.getArrayPosition(inVar);
    let inRec = this.stack.stack[inPos];
    let code =  this.generate("READI",inRec.name);
    return code;
  }

  //Generates the write
  //OUT: returns the string generated
  WriteExpr(outExpr) {
    let outPos = this.getArrayPosition(outExpr);
    let outRec = this.stack.stack[outPos];
    let code = this.generate("WRITEI",this.extractExpr(outRec));
    return code;
  }
  
  getArrayPosition(actionPosition) {
    let result = -999;
    if (actionPosition === 0) {
      result = this.stack.pointers.leftIndex - 1;
    } else {
      result = this.stack.pointers.rightIndex - 1 + actionPosition - 1;
    }
    return result;
  }
  
  GenInfix(e1 ,op ,e2, dest) {
    
    let e1pos = this.getArrayPosition(e1);
    let e2pos = this.getArrayPosition(e2);
    let opPos = this.getArrayPosition(op);
    
    //create the temp record
    let tempName = this.getTemp();
    let exprRec = new types.ExpressionRecord(tempName,types.ExpressionKind.TEMP_EXPR);
    exprRec.name = tempName;
    
    let code = this.generate(
        this.extractOp(this.stack.stack[opPos]),
        this.extractExpr(this.stack.stack[e1pos]), 
        this.extractExpr(this.stack.stack[e2pos]), 
        exprRec.name);

    if (dest === 0) {
      this.stack.stack[this.stack.pointers.leftIndex - 1] = exprRec;  
    } else {
      this.stack.stack[this.stack.pointers.rightIndex - 1 + dest - 1] = exprRec;  
    }

    return code;
  }

  //processes from the $$=LHS so no index number required
  ProcessId() {
    log.verbose("[Semantic] ProcessId()");
    let token = this.currentItem();
    this.checkId(token);
    let name = token;
    let s = new types.ExpressionRecord("Id",types.ExpressionKind.ID_EXPR,name);
    this.stack.stack[this.stack.pointers.leftIndex - 1] = s;
  }
  
  //processes from the $$=LHS so no index number required
  ProcessLiteral() {
    log.verbose("[Semantic] ProcessLiteral()");
    let value = this.currentItem();
    let s = new types.ExpressionRecord("IntLiteral",types.ExpressionKind.LITERAL_EXPR,value);
    this.stack.stack[this.stack.pointers.leftIndex - 1] = s;
  }
  
  //processes from the $$=LHS so no index number required
  //Take a plus/minus token and returns a new OperatorRecord
  ProcessOp() {
    log.verbose("[Semantic] ProcessOp()");
    let token = this.currentItem();
    let s;
    if (token === "+") {
      s = new types.OperatorRecord(types.OperatorKind.PLUS_OP);      
    } else if (token === "-") {
      s = new types.OperatorRecord(types.OperatorKind.MINUS_OP);      
    } else {
      throw "[Semantic][ProcessOp] Cannot work with " + token + " here.";
    }
    this.stack.stack[this.stack.pointers.leftIndex - 1] = s;
  }
  
  currentItem() {
    let curS =  this.stack.stack[this.stack.pointers.currentIndex-2];
    return curS;
  }
  
  Start() {
    //Instantiating this class does the heavy lifting
    //that this method used to do.
    log.verbose("[Semantic] Start()");
  }
  
  //finishing instruction. yay!
  Finish() /*: string */ {
    log.verbose("[Semantic] Finish()");
    //let code = this.generate("HALT");
    //return code;
  }
  
  Copy(sourcePosition,destPosition) {
    
    log.verbose("[Semantic] Copy(",sourcePosition,",",destPosition,")");
    
    let source = this.getArrayPosition(sourcePosition);
    let dest = this.getArrayPosition(destPosition);

    this.stack.stack[dest] = this.stack.stack[source];
  }

}

module.exports = Semantic;