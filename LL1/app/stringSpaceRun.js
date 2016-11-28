"use strict";

//ECMAScript 6 (NodeJS v6.5.0)
//Homework #10
//18-NOV-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var StringSpace = require('../app/stringSpace.js');
let stringSpace = new StringSpace();

console.log("Space: " + stringSpace.toString());
let node;
node = stringSpace.enter("TestSymbol");
console.log("Node: " + JSON.stringify(node));
node = stringSpace.enter("TestSymbol2");
console.log("Node: " + JSON.stringify(node));
node = stringSpace.enter("LParen");
console.log("Node: " + JSON.stringify(node));
node = stringSpace.enter("TestSymbol");
console.log("Node: " + JSON.stringify(node));
node = stringSpace.enter("RParen");
console.log("Node: " + JSON.stringify(node));
console.log("Space: " + stringSpace.toString());

let name = stringSpace.getString(10,10);
console.log("Name: " + name);

console.log("Finished");

