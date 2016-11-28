"use strict";

var log = require('winston');

function DataNode(index, offset) {
  this.index = index;
  this.offset = offset;
}

class StringSpace {

  constructor() {
    this.table = [];
    this.space = [];
    this.currentIndex = 0;

    log.verbose("###################################");
    log.verbose("#");
    log.verbose("# StringSpace has been constructed.");
    log.verbose("#");
    log.verbose("###################################");
  }
  
  //IN:  input is a string symbol to lookup
  //OUT: returns "node" of index and offset data
  lookup(symbol) {
    
    log.verbose("[StringSpace] Lookup up symbol, '" + symbol + "'");

    for (let i = 0; i < this.table.length; i++) {
      let node = this.table[i];
      
      if (node.offset === symbol.length-1) {
        //interested in this one because of size
        let s = this.getString(node.index,node.offset);
        if (s === symbol) {
          return node;
        }
      }
    }

  }
  
  //get the string back given the index and offset
  getString(index,offset) {
    let s = this.space.join("").substr(index, offset+1);
    return s;
  }
  
  //Enter a symbol into the common string space.
  //IN:  The symbol to be entered into the string space
  //OUT: return a data object with index and offset coordinates
  enter(symbol) {
    
    log.debug("[StringSpace] Entering '" + symbol + "' to table.");
    let node = this.lookup(symbol);
    if (!node) {
      node = new DataNode(this.currentIndex,symbol.length-1);
      this.table.push(node);
      for (let i = 0; i < symbol.length; i++) {
        this.space.push(symbol[i]);
      }
      this.currentIndex += symbol.length; 
    }

    return node;
    
  }
  
  toString() {
    let s = "";
    s += "Table: " + JSON.stringify(this.table) + "\n";
    s += "Space: " + this.space;
    return s;
  }

}

module.exports = StringSpace;