"use strict";

var types = require("./lib/types.js");
var log = require('winston');

class SemanticStack {

  //constructor requires a start symbol
  constructor(startSymbol) {
    this.stack = [startSymbol];
    this.pointers = {
      leftIndex:    0,
      rightIndex:   0,
      currentIndex: 1,
      topIndex:     2
    };
    
    log.verbose("#####################################");
    log.verbose("#");
    log.verbose("# SemanticStack has been constructed.");
    log.verbose("#");
    log.verbose("#####################################");

  }
  
  setToken(token /*: string */) {
    this.stack[this.pointers.currentIndex-1] = token;
    this.pointers.currentIndex++;
  }
  
  //returns eop object
  pushEOP(symbols /*: Array */) {
    
    //deep copy with flag for "typeof" detection later
    let eop = {
      eop: true,
      leftIndex:    this.pointers.leftIndex,
      rightIndex:   this.pointers.rightIndex,
      currentIndex: this.pointers.currentIndex,
      topIndex:     this.pointers.topIndex
    };
    log.debug("[SemanticStack] Pushing EOP, start stack=",this.stackToString(),"; start pointers=",this.pointersToString());

    let noActionCount = 0;
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i].indexOf("#") === 0) {
        //action symbol... skip quietly
      } else {
        this.stack.push(symbols[i]);
        noActionCount++;
      }
    }

    this.pointers.leftIndex = this.pointers.currentIndex;
    this.pointers.rightIndex = this.pointers.topIndex;
    this.pointers.currentIndex = this.pointers.rightIndex;
    this.pointers.topIndex = this.pointers.topIndex + noActionCount;
    log.debug("[SemanticStack] Pushing EOP,   end stack=",this.stackToString(),"; start pointers=",this.pointersToString());

    return eop;
  }

  //restart the indices from the EOP record
  //X is an EOP record (X.eop = true)
  popEOP(X) {

    if (!X.eop) {
      //not an eop record.
      return;
    }
    
    this.pointers.leftIndex = X.leftIndex;
    this.pointers.rightIndex = X.rightIndex;
    this.pointers.currentIndex = X.currentIndex;
    this.pointers.topIndex = X.topIndex;
    
    //if the topIndex is taller than the stack, 
    //pop off until it's not.
    while (this.stack.length >= X.topIndex) {
      this.stack.pop();
    }
    
    this.pointers.currentIndex++;
    
    log.debug("[SemanticStack] popped EOP, X=" + JSON.stringify(X) + ";pointers now at " + this.pointers);
    
  }
  
  stackToString() {
    //copy the stack/array
    //NOTE: This reverses the array so the stack "reads" from left-to-right.
    var newArray = this.stack.slice(0).reverse();
    for (let i = 0; i < newArray.length; i++) {
      let s = newArray[i];
      if (s.expressionRecord) {
        switch (s.kind) {
          case types.ExpressionKind.ID_EXPR:
            newArray[i] = "Id[" + s.name + "]";
            break;
          case types.ExpressionKind.LITERAL_EXPR:
            newArray[i] = "Literal[" + s.val + "]";
            break;
          case types.ExpressionKind.TEMP_EXPR:
            newArray[i] = "Temp[" + s.name + "]";
            break;
          default:
            newArray[i] = "Expr!BOGUS!";
        }
      } else if (s.operatorRecord) {
        switch (s.kind) {
          case types.OperatorKind.MINUS_OP:
            newArray[i] = "Op[-]";
            break;
          case types.OperatorKind.PLUS_OP:
            newArray[i] = "Op[+]";
            break;
          default:
            newArray[i] = "Op!BOGUS!";
        }
      }
    }
    return newArray.join(" ");
  }
  
  pointersToString() {
    return "(" + 
    this.pointers.leftIndex + ","+
    this.pointers.rightIndex + ","+
    this.pointers.currentIndex + ","+ 
    this.pointers.topIndex + ")";
  }

}

module.exports = SemanticStack;