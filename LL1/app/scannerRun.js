"use strict";

var Scanner = require('./scanner.js');
var log = require('winston');
log.level = "verbose";

var reservedTokens = {
  BeginSym:   "begin",
  EndSym:     "end",
  ReadSym:    "read",
  WriteSym:   "write",
  EOfScan:    "$"
};

let programString = "begin A := BB + 314 + A; end $";
let scanner = new Scanner(programString,reservedTokens);
log.info(scanner.tokensAsString());
