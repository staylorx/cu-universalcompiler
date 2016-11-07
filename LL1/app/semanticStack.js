"use strict";

var log = require('winston');
log.level = "info";

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
  }
  
  currentItem() {
    return this.stack[this.pointers.currentIndex - 1];
  }
  
  pushToken(token /*: string */) {
    this.stack[this.pointers.currentIndex] = token;
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
    
    for (let i = 0; i < symbols.length; i++) {
      this.stack.unshift(symbols[i]);
    }

    this.pointers.leftIndex = this.pointers.currentIndex;
    this.pointers.rightIndex = this.pointers.topIndex;
    this.pointers.currentIndex = this.pointers.rightIndex;
    this.pointers.topIndex = this.pointers.topIndex + symbols.length;
    
    return eop;
  }

  //restarot the indices from the EOP record
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
    
  }
  
  toString() {
    return this.stack.join(" ") + "(" + 
    this.pointers.leftIndex + ","+
    this.pointers.rightIndex + ","+
    this.pointers.currentIndex + ","+ 
    this.pointers.topIndex + ")";
  }
  
}

module.exports = SemanticStack;