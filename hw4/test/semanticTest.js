"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Refactored test from Homework #1, Problem #1 (+ ** and = extension)
//25-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Semantic = require('../app/semantic.js');
var log = require('winston');
log.level = "verbose";

xdescribe('Semantic Tests, little stuff first', function(){

  var semantic = new Semantic();

  it('Generate, zero arg', function(){
    assert.throws(  () => semantic.generate(),/Argument count must be between 1 and 4/);
  });
  it('Generate, single arg', function(){
    assert(semantic.generate("OPT") === "OPT");
  });
  it('Generate, two arg', function(){
    assert(semantic.generate("OPT","A") === "OPT A");
  });
  it('Generate, three arg', function(){
    assert(semantic.generate("OPT","A","B") === "OPT A,B");
  });
  it('Generate, four args', function(){
    assert(semantic.generate("OPT","A","B","C") === "OPT A,B,C");
  });
  it('Generate, five args', function(){
    assert.throws(
      () => semantic.generate("OPT","A","B","C","D"), /Argument count must be between 1 and 4/);
  });

});


xdescribe('Semantic Tests, checkId and getTemp', function(){

  var semantic = new Semantic();

  it('checkId', function(){
    assert(semantic.checkId("TestSym") === "Declare TestSym,Integer");
  });

  it('getTemp', function(){
    assert(semantic.getTemp() === "Temp&1");
    assert(semantic.getTemp() === "Temp&2");
  });

  
});
