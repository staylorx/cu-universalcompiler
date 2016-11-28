"use strict";

var log = require('winston');
var LinkedList = require('singly-linked-list');
var StringSpace = require('./stringSpace.js');

function Node(stringPosition, scopeNumber = 1) {
  this.stringPosition = stringPosition;
  this.scopeNumber = scopeNumber;
}

class SymbolTable {

  constructor() {
    log.verbose("[SymbolTable] Creating symbol table");
    this.table = new Map();
    this.stringSpace = new StringSpace();

    log.verbose("###################################");
    log.verbose("#");
    log.verbose("# SymbolTable has been constructed.");
    log.verbose("#");
    log.verbose("###################################");
  }
  
  //ensure a position of the symbol in the hash table
  checkHashPosition(symbol) {
    let letter = bigUps(symbol);
    if (this.table.get(letter) === undefined) {
      //can't find a list... so add one.
      this.table.set(letter, new LinkedList());
    }
  }
  
  //lookup a symbol and scope.
  //OUT: Returns true if the symbol and scope are found. Else false.
  lookup(symbol, scope = 1) {
    
    log.debug("[SymbolTable][lookup] Lookup up symbol, '" + symbol +"("+scope+")'");
    let isFound = false;
    
    //go through the linked list
    let list = this.table.get(bigUps(symbol));
    if (list === undefined) {
      return false;
    }
    
    list.forEach( node => {
      let name = this.stringSpace.getString(node.data.stringPosition.index,node.data.stringPosition.offset); 
      if (name === symbol && node.data.scopeNumber === scope) {
        log.debug("[SymbolTable][lookup] Found " + symbol);
        isFound = true;
      }        
    });
    
    return isFound;

  }
  
  //Enter a symbol and scope into the symbol table.
  enter(symbol,scope = 1) {
    
    log.debug("[SymbolTable] Entering '" + symbol + "("+scope+")' to table.");
    let pos = this.lookup(symbol, scope);
    if (!pos) {
      this.checkHashPosition(symbol);
      let list = this.table.get(bigUps(symbol));
      //create or fetch the name in string space
      let stringPos = this.stringSpace.enter(symbol);
      list.insertFirst(new Node(stringPos, scope));    
    }

  }
  
  //given a scope number pop every one off
  closeScope(scope) {
    this.table.forEach( (list,key) => {
      while (!list.isEmpty() && (list.getHeadNode().getData().scopeNumber === scope)) {
        list.removeFirst();
      }
      if (list.isEmpty()) {
        this.table.delete(key);
      }        
    });
  }
  
  toString() {
    let s = "";
    
    this.table.forEach( (value,key) => {
      s += "-- Key=" + key + ": ";
      value.forEach( node => {
        let name = this.stringSpace.getString(node.data.stringPosition.index,node.data.stringPosition.offset); 
        s += name + "(" + node.data.scopeNumber + ") ";
      });
      s += "\n";
    });
    if (s.length === 0 ) {
      s += "-- No symbols.";
    }
    
    return s;
  }

}

function bigUps(symbol) {
  return symbol.charAt(0).toUpperCase();
}

module.exports = SymbolTable;