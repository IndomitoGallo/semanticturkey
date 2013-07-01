/*
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is SemanticTurkey.
 * 
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 * 
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART) Current
 * information about SemanticTurkey can be obtained at
 * http://semanticturkey.uniroma2.it
 * 
 */

let EXPORTED_SYMBOLS = [ "STException", "STError", "STFail", "HTTPError" ];


// abstract javascript error with an additional parameter for specifying the java exception which was reported
// in the STResponse 
function STAbstractJavaException(javaException, message) {
  this.name = "STAbstractJavaException";
  this.javaException = javaException;
  this.message = message || "";
}
STException.prototype = new Error();
STException.prototype.constructor = STAbstractJavaException;

// a javascript error for severe Java Exceptions (runtime exceptions not caught by the services) with an
// additional parameter for specifying the java exception which was reported in the STResponse. 
function STError(javaException, message) {
  this.name = "STError";
  this.javaException = javaException;
  this.message = message || "";
}
STError.prototype = new STAbstractJavaException();
STError.prototype.constructor = STError;

// a javascript error for Java Exceptions (exceptions caught by the services) with an additional parameter
// for specifying the java exception which was reported in the STResponse. 
function STException(message) {
  this.name = "STException";
  this.javaException = javaException;
  this.message = message || "";
}
STException.prototype = new STAbstractJavaException();
STException.prototype.constructor = STException;

// a javascript error for telling that a given operation could not be completed, usually due to foreseen
// constraints of the application 
function STFail(message) {
  this.name = "STFail";
  this.message = message || "";
}
STFail.prototype = new Error();
STFail.prototype.constructor = STFail;


// a javascript error for errors 
function HTTPError(status, statusText) {
  this.name = "HTTPError";
  this.status = status || "";
  this.statusText = statusText || "";
  this.message = statusText || "";
}
HTTPError.prototype = new Error();
HTTPError.prototype.constructor = HTTPError; 