"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #10
//11-NOV-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var SymbolTable = require('../app/symbolTable.js');
let symbolTable = new SymbolTable();

symbolTable.enter("TestSymbol",1);
console.log("Table: " + symbolTable.toString());

symbolTable.enter("TestSymbol2",1);
console.log("Table: " + symbolTable.toString());

symbolTable.enter("LParen",1);
console.log("Table: " + symbolTable.toString());

symbolTable.enter("TestSymbol",2);
console.log("Table: " + symbolTable.toString());

//Special case that won't close out
symbolTable.enter("RParen",1);
console.log("Table: " + symbolTable.toString());
symbolTable.enter("RParen",2);
console.log("Table: " + symbolTable.toString());
symbolTable.enter("RParen",3);
console.log("Table: " + symbolTable.toString());
symbolTable.enter("RParen",4);
console.log("Table: " + symbolTable.toString());

//Close the scopes one by one. Since 4 isn't close RParen will stay.
symbolTable.closeScope(3);
console.log("Table: " + symbolTable.toString());
symbolTable.closeScope(2);
console.log("Table: " + symbolTable.toString());
symbolTable.closeScope(1);
console.log("Table: " + symbolTable.toString());

//close them all
let i = 5;
while (i-- > 0) {
  symbolTable.closeScope(i);
}
console.log("Table: " + symbolTable.toString());

console.log("Finished");

