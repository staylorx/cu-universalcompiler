"use strict";

//ECMAScript 6 (NodeJS 4.4+)
//Homework #2
//30-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var Parser = require('../app/parser.js');
var log = require('winston');
log.level = "verbose";

var programString = `BEGIN A := B +(72 - C); END`;
log.info("========== HW#2, Program #1 listing:\n",programString);
var parser = new Parser(programString);
parser.parse();
