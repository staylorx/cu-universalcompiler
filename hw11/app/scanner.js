"use strict";

//ECMAScript v6.5.0
//Supporting Homework #2, refactored from HW#1
//30-AUG-2016
//Stephen Taylor, University of Colorado Denver
//staylorx@gmail.com

var log = require('winston');
var Readable = require('stream').Readable;
log.level = "info";

class Scanner {

  //Sets the readable stream so the scanner can work on it.
  //IN:  readableInput is either a Readable or a {S,s}tring
  //IN:  an object of valid tokens
  constructor(readableInput, validTokens) {
    
    this.readable = new Readable();
    
    this.tokenBuffer = "";
    this.readToken = "";

    if (validTokens === undefined) {
      throw "Scanner: A set of valid tokens must be provided";
    }
    
    this.validTokens = validTokens;
    
    if (typeof(readableInput) == 'string' || readableInput instanceof String) {
      this.readable.push(readableInput);
      //add EOF to the stream... very important to end the stream!
      this.readable.push(null);
    } else if (readableInput instanceof Readable) {
      this.readable = readableInput;
    } else {
      throw("Scanner: No suitable input to scan.");
    }
    this.tokenBuffer = "";
  }

  //Adds its argument to a character buffer called [tokenBufferSymbol]
  //IN:  currentChar is a character to be added to the token buffer.
  bufferChar(currentChar) {
    if (currentChar !== undefined) {
      this.tokenBuffer += currentChar;
    }
  }

  //Resets the buffer to the empty string
  clearBuffer() {
    this.readToken = this.tokenBuffer;
    this.tokenBuffer = "";
  }

  //Takes the identifiers as they are recognized and returns
  //the proper token class (either Id or some reserved word)
  //IN:  checkString is the identifier to be checked
  //OUT: returns the token as string or "BOGUS" if not found
  checkReserved(checkString) {
    for (var token in this.validTokens) {
      if (this.validTokens[token] == checkString) {
        return token;
      }
    }
    return undefined;
  }

  //pick off a single character and return it
  //OUT: returns a character if found from the stream,
  //     otherwise undefined.
  readChar() {
    var char = this.readable.read(1);
    if (char !== null) {
      return char;
    }
  }

  //put a character back if we've read too far
  //IN:  char is a single character to put back in the stream.
  writeChar(char) {
    this.readable.unshift(char);
  }

  //An error function
  //IN:  currentChar is the offending character that can't be parsed
  //OUT: log an error message
  lexicalError(currentChar) {
    log.error("character " + currentChar + " could not be parsed.");
  }

  //Scanner recognizes micro identifiers and integer constances.
  //It skips white space such as tabs, spaces, and EOL.
  //OUT: returns a single token
  scan() {
  
      this.clearBuffer();
      var char;
      
      //loop through until stream has no more characters.
      while ((char = this.readChar()) !== undefined) {
        
        if (char === undefined) {
          //end of stream == end of file
          return "EofSym";
  
        } else if (/\s/g.test(char)) {
          //quietly skip spaces, tabs, newlines
  
        } else if (/^[a-z]/i.test(char)) {
          //looking for IDs
          this.bufferChar(char);
          while( (char = this.readChar()) !== undefined && /^[A-Za-z0-9_]/.test(char)) {
            this.bufferChar(char);
          }
          this.writeChar(char);
  
          //check the token against the reserved words list.
          //if it's not in there, it's an Id.
          let tempToken = this.checkReserved(this.tokenBuffer.toString());
          if (tempToken === undefined) {
            log.debug("Testing '",this.tokenBuffer,"' ,which came back as",tempToken,". It's an Id.");
            return this.checkReserved("ID");
          } else {
            return tempToken;
          }
  
        } else if (/^[0-9]/.test(char)) {
          //looking for integers here
          this.bufferChar(char);
          while( (char = this.readChar()) !== undefined && /^[0-9]/.test(char)) {
            this.bufferChar(char);
          }
          this.writeChar(char);
          return this.checkReserved("INT");

        } else if (/[();,+=]/.test(char)) {
          //parens, semicolon, comma, and plus
          return this.checkReserved(this.tokenBuffer = char.toString());
  
        } else if (/[:]/.test(char)) {
          //check the colon, looking for assignment oper
          if ((char = this.readChar()) !== undefined && /[=]/.test(char)) {
            return this.checkReserved(this.tokenBuffer = ":=");
          } else {
            this.lexicalError(char);
          }
          this.writeChar(char);
  
        } else if (/[-]/.test(char)) {
          //check the dash which might be comment, might be minus
          if (/[-]/.test(char = this.readChar())) {
            //until the end of line
            while( (char = this.readChar()) !== undefined && !/\n/.test(char)) {
              //quietly swallow the comment
            }
          } else {
            this.writeChar(char);
            return this.checkReserved(this.tokenBuffer = "-");
          }
  
        } else if (/[*]/.test(char)) {
          //check the exponent
          if ((char = this.readChar()) !== undefined && /[*]/.test(char)) {
            return this.checkReserved(this.tokenBuffer = "**");
          } else {
            this.lexicalError(char);
          }
          this.writeChar(char);
  
        } else {
          //default if it gets to here
          this.lexicalError(char);
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

module.exports = Scanner;