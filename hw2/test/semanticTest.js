"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Refactored test from Homework #1, Problem #1 (+ ** and = extension)
//25-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Symantic = require('../app/semantic.js');
var log = require('winston');
log.level = "verbose";

xdescribe('Symantic Tests, little stuff first', function(){

  var symantic = new Symantic();

  it('Generate, zero arg', function(){
    assert.throws(  () => symantic._generate(),/Argument count must be between 1 and 4/);
  });
  it('Generate, single arg', function(){
    assert(symantic._generate("OPT") === "OPT");
  });
  it('Generate, two arg', function(){
    assert(symantic._generate("OPT","A") === "OPT A");
  });
  it('Generate, three arg', function(){
    assert(symantic._generate("OPT","A","B") === "OPT A,B");
  });
  it('Generate, four args', function(){
    assert(symantic._generate("OPT","A","B","C") === "OPT A,B,C");
  });
  it('Generate, five args', function(){
    assert.throws(
      () => symantic._generate("OPT","A","B","C","D"), /Argument count must be between 1 and 4/);
  });

});


xdescribe('Symantic Tests, checkId and getTemp', function(){

  var symantic = new Symantic();

  it('checkId', function(){
    assert(symantic.checkId("TestSym") === "Declare TestSym,Integer");
  });

  it('getTemp', function(){
    assert(symantic._getTemp() === "Temp&1");
    assert(symantic._getTemp() === "Temp&2");
  });

  
});
