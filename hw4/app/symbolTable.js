"use strict";

var log = require('winston');
log.level = "info";

class SymbolTable {

  constructor(maxSymbolSize = 1024) {
    log.verbose("SymbolTable: Creating symbol table of size",maxSymbolSize);
    this.maxSymbol = maxSymbolSize;
    this.symbolTable = new Array(maxSymbolSize);
    this.lastSymbol = 0;
  }
  
  lookup(symbol) {
    log.debug("Lookup up symbol, '" + symbol + "'...");
    let up = false;
    for (let i in this.symbolTable) {
      if (this.symbolTable[i] === symbol) {
        log.debug("... symbol is found.");
        up = true;
        break;
      } else {
        log.debug("... symbol is not found.");
      }
    }
    return up;
  }
  
  enter(symbol) {
    log.debug("Entering symbol, '" + symbol + "' to table.");
    if (this.lastSymbol < this.maxSymbol) {
      
      //I don't need to ensure this array is unique
      //but it will drive me nuts if it isn't.
      if (!this.lookup(symbol)) {
        //couldn't find the symbol in the array...
        //so adding it now.
        this.lastSymbol++;
        this.symbolTable[this.lastSymbol] = symbol;
      }
      
    } else {
        this.symbolTableOverflow();
    }
  }
  
  symbolTableOverflow() {
      log.error("The symbol table is not large enough.");
      throw "SymbolTableOverflow";
  }
  
}

module.exports = SymbolTable;