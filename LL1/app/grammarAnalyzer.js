"set strict";

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var log = require('winston');
log.level = "debug";

var instream = fs.createReadStream('./grammar1.txt');
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);

var nonTerminals = new Set();
var terminals = new Set(["begin", "Id", "read", "write", "λ", ",", ":=", ";", "IntLiteral", "(", ")", "+", "-", "$"]);

rl.on('line', function(line) {
  
  //not a valid production if it can't split on "->"
  var lineSplit = line.split('->');
  
  //work the left hand side
  var lhs = lineSplit[0].match(/<[\w ]+>/g); 
  nonTerminals.add(lhs[0]);
  
  //now the trickier right hand side
  var rhString = lineSplit[1];
  var rhs = rhString.match(/<[\w ]+>/g); 
  //loop through each terminal found...
  //add it to the non-terminals and pad it with a space
  for (let i in rhs) {
    //should match the left hand side anyway but to be sure
    nonTerminals.add(rhs[i]);
    rhString = rhString.replace(rhs[i]," " + rhs[i] + " ");
  }
  
  //go through each of the terminals and put some space between things.
  for (let i in terminals) {
    rhString = rhString.replace(terminals[i]," " + terminals[i] + " ");
  }

});

rl.on('close', function() {
  //log.verbose("Nonterminals:",nonTerminals);
  //log.verbose("Terminals:",terminals);
  markLambda();
});

function markLambda(grammar) {
  var changes = true;
  var derivesLambda = new Map();
  var rhsDerivesLambda = false;
  for (let nt in nonTerminals) {
    derivesLambda.set(nt,false);    
  }
  for (let t in terminals) {
    derivesLambda.set(t,false);    
  }
  log.debug(derivesLambda);
  
  // while(changes) {
  //   changes = false;
  //   for (let P in g.productions) {
  //     rhsDerivesLambda = true;      
  //     for (let i in 1..RHS_Length(P)) {
  //       rhsDerivesLambda = rhsDerivesLambda && DerivesLambda(RHS[P][i])        
  //     }
  //     for(let symbol in RHS(P)) {
  //       if (rhsDervicesLambda && !derivesLambda(LHS[P])) {
  //         changes = true;       
  //         derivesLambda(LHS[P]) = true;
  //       }       
  //     }
  //   }
  //}
}

