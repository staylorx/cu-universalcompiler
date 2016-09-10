"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Refactored test from Homework #1, Problem #1 (+ ** and = extension)
//25-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var assert = require('assert');
var Parser = require('../app/parser.js');
var log = require('winston');
log.level = "verbose";

xdescribe('Parser Tests', function(){
  log.level = "verbose";

  it('Testing the Parser.', function(){
    var programString = `BEGIN A := B +(72 - C); END`;
    log.info("========== HW#2, Program #1 listing:\n",programString);
    var parser = new Parser(programString);
    try {
      parser.parse();
      assert(true,"Parsing completed successfully.");
    } catch(err) {
      assert(false,"Parsing failed: " + err);
    }
  });

});
