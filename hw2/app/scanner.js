"use strict";

//ECMAScript v6.5.0
//Supporting Homework #2, refactored from HW#1
//30-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var log = require('winston');
var Readable = require('stream').Readable;
var types = require('./types.js');
log.level = "verbose";

//ECMA v6.5.0
class Scanner {

  //Sets the readable stream so the scanner can work on it.
  //IN:  readableInput is either a Readable or a {S,s}tring
  constructor(readableInput) {
    
    this._readable = new Readable();
    this._tokenBuffer = "";
    
    if (typeof(readableInput) == 'string' || readableInput instanceof String) {
      this._readable.push(readableInput);
      //add EOF to the stream... very important to end the stream!
      this._readable.push(null);
    } else if (readableInput instanceof Readable) {
      this._readable = readableInput;
    } else {
      log.error("No suitable input to scan.");
    }
    this._tokenBuffer = "";
  }

  //Adds its argument to a character buffer called [tokenBufferSymbol]
  //IN:  currentChar is a character to be added to the token buffer.
  _bufferChar(currentChar) {
    if (currentChar !== undefined) {
      this._tokenBuffer += currentChar;
    }
  }

  //Resets the buffer to the empty string
  _clearBuffer() {
    this._tokenBuffer = "";
  }

  //Takes the identifiers as they are recognized and returns
  //the proper token class (either Id or some reserved word)
  //IN:  checkString is the identifier to be checked
  //OUT: returns the token as string or "BOGUS" if not found
  checkReserved(checkString) {
    for (var token in TOKENS) {
      if (TOKENS[token] == checkString) {
        return token;
      }
    }
    return undefined;
  }

  //pick off a single character and return it
  //OUT: returns a character if found from the stream,
  //     otherwise undefined.
  _readChar() {
    var char = this._readable.read(1);
    if (char !== null) {
      return char;
    }
  }

  //put a character back if we've read too far
  //IN:  char is a single character to put back in the stream.
  _writeChar(char) {
    this._readable.unshift(char);
  }

  //An error function
  //IN:  currentChar is the offending character that can't be parsed
  //OUT: log an error message
  _lexicalError(currentChar) {
    log.error("character " + currentChar + " could not be parsed.");
  }

  //Scanner recognizes micro identifiers and integer constances.
  //It skips white space such as tabs, spaces, and EOL.
  //OUT: returns a single token
  scan() {
  
      this._clearBuffer();
      var char;
      
      //loop through until stream has no more characters.
      while ((char = this._readChar()) !== undefined) {
        
        if (char === undefined) {
          //end of stream == end of file
          return "EofSym";
  
        } else if (/\s/g.test(char)) {
          //quietly skip spaces, tabs, newlines
  
        } else if (/^[a-z]/i.test(char)) {
          //looking for IDs
          this._bufferChar(char);
          while( (char = this._readChar()) !== undefined && /^[A-Za-z0-9_]/.test(char)) {
            this._bufferChar(char);
          }
          this._writeChar(char);
  
          //check the token against the reserved words list.
          //if it's not in there, it's an Id.
          let tempToken = this.checkReserved(this._tokenBuffer.toString());
          if (tempToken === undefined) {
            log.debug("Testing '",this._tokenBuffer,"' ,which came back as",tempToken,". Making it an Id.");
            let exprRec = new types.ExpressionRecord("Id",types.ExpressionKind.ID_EXPR,this._tokenBuffer);
            return exprRec.symbol;
          } else {
            return tempToken;
          }
  
        } else if (/^[0-9]/.test(char)) {
          //looking for integers here
          this._bufferChar(char);
          while( (char = this._readChar()) !== undefined && /^[0-9]/.test(char)) {
            this._bufferChar(char);
          }
          this._writeChar(char);
          let exprRec = new types.ExpressionRecord("IntLiteral",types.ExpressionKind.LITERAL_EXPR,this._tokenBuffer);
          return exprRec.symbol;

        } else if (/[();,+=]/.test(char)) {
          //parens, semicolon, comma, and plus
          return this.checkReserved(char);
  
        } else if (/[:]/.test(char)) {
          //check the colon, looking for assignment oper
          if ((char = this._readChar()) !== undefined && /[=]/.test(char)) {
            return this.checkReserved(":=");
          } else {
            this._lexicalError(char);
          }
          this._writeChar(char);
  
        } else if (/[-]/.test(char)) {
          //check the dash which might be comment, might be minus
          if (/[-]/.test(char = this._readChar())) {
            //until the end of line
            while( (char = this._readChar()) !== undefined && !/\n/.test(char)) {
              //quietly swallow the comment
            }
          } else {
            this._writeChar(char);
            return this.checkReserved("-");
          }
  
        } else if (/[*]/.test(char)) {
          //check the exponent
          if ((char = this._readChar()) !== undefined && /[*]/.test(char)) {
            return this.checkReserved("**");
          } else {
            this._lexicalError(char);
          }
          this._writeChar(char);
  
        } else {
          //default if it gets to here
          this._lexicalError(char);
        }
  
      } //end while
  
      return "EofSym";
  }
 
  /*
   * Helper method run the scans and output as a string
   * OUT: String of all the tokens together
   */
  tokensAsString() {
  
    let token = "";
    //run through the stream
    var outString = "";
    while ((token = this.scan()) !== "EofSym") {
      outString += token + " ";
      log.debug(token);
    }
    outString += "EofSym";
    
    return outString;
  }
  
}

//An enumeration (of sorts) to hold the tokens.
var TOKENS = {
  BeginSym:   "BEGIN",
  EndSym:     "END",
  ReadSym:    "READ",
  WriteSym:   "WRITE",
  Id:         "ID",
  IntLiteral: "INT",
  LParen:     "(",
  RParen:     ")",
  SemiColon:  ";",
  Comma:      ",",
  AssignOp:   ":=",
  PlusOp:     "+",
  MinusOp:    "-",
  EqualOp:    "=",
  ExpnOp:     "**",
  EofSym:     "EOF"
};

module.exports = Scanner;