"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//02-SEP-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var SymbolTable = require('../app/symbolTable.js');
var log = require('winston');
log.level = "verbose";

xdescribe('Symbol Table Tests', function(){

  it('Test zero size symbol table', function(){
    var symbolTable = new SymbolTable(0);
    assert(symbolTable._lastSymbol === 0);
    assert(symbolTable._maxSymbol === 0);
  });

  it('Test sized symbol table', function(){
    var symbolTable = new SymbolTable(42);
    assert(symbolTable._lastSymbol === 0);
    assert(symbolTable._maxSymbol === 42);
  });
  
  it('Lookup non-existing symbol', function(){
    var symbolTable = new SymbolTable(4);
    var ret = symbolTable.lookup("BogusSym");
    assert(ret === false);
  });

  it('Lookup symbol', function(){
    var symbolTable = new SymbolTable(4);
    symbolTable.enter("BogusSym1");
    symbolTable.enter("BogusSym2");
    symbolTable.enter("BogusSym3");
    assert(symbolTable.lookup("BogusSym2") === true);
  });

  //The deduplicator implies the lookup works.
  it('Add symbol, no duplicates', function(){
    var symbolTable = new SymbolTable(4);
    symbolTable.enter("BogusSym1");
    symbolTable.enter("BogusSym1");
    symbolTable.enter("BogusSym1");
    symbolTable.enter("BogusSym2");
    assert(symbolTable._lastSymbol === 2);
  });

});
