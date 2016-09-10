"use strict";

var log = require('winston');
log.level = "verbose";

class SymbolTable {

  constructor(maxSymbolSize = 1024) {
    log.verbose("Creating symbol table of size",maxSymbolSize);
    this._maxSymbol = maxSymbolSize;
    this._symbolTable = new Array(maxSymbolSize);
    this._lastSymbol = 0;
  }
  
  lookup(symbol) {
    log.debug("Lookup up symbol, '" + symbol + "'...");
    let up = false;
    for (let i in this._symbolTable) {
      if (this._symbolTable[i] === symbol) {
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
    if (this._lastSymbol < this._maxSymbol) {
      
      //I don't need to ensure this array is unique
      //but it will drive me nuts if it isn't.
      if (!this.lookup(symbol)) {
        //couldn't find the symbol in the array...
        //so adding it now.
        this._lastSymbol++;
        this._symbolTable[this._lastSymbol] = symbol;
      }
      
    } else {
        this._symbolTableOverflow();
    }
  }
  
  _symbolTableOverflow() {
      log.error("The symbol table is not large enough.");
      throw "SymbolTableOverflow";
  }
  
}

module.exports = SymbolTable;