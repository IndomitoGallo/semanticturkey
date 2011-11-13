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
 
/**
 * TODO I should add a listener for the logging preference "extensions.semturkey.log"
 */

Components.utils.import("resource://stmodules/Preferences.jsm");
//Components.utils.import("resource://stmodules/Observers.jsm");

let EXPORTED_SYMBOLS = ["Logger"];
 

Logger = {
	//logLevel = Preferences.get("extensions.semturkey.log");
};

Logger.prototype = {
		
	logLevel: Preferences.get("extensions.semturkey.log"),
		
	getExceptionMessage: function(e) {	
		var errorMsg;		
		if (e.getMessage) {
			errorMsg = e + ": " + e.getMessage() + "\n";
			while (e.getCause() != null) {
				e = e.getCause();
				errorMsg += "caused by " + e + ": " + e.getMessage() + "\n";
			}
		} else {
			errorMsg = e;
		}
		return errorMsg;		
	},

	debug: function(msg) {
		if ((this.logLevel == "debug") || this.logLevel == "info")
			Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(msg);
	},
	
	printException: function(e) {
		Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService).logStringMessage(this.getExceptionMessage(e));
	},
	
	alertMessage: function(e) {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "exception tracker alert", this.getExceptionMessage(e));
	}
};

// Give the constructor the same prototype as its instances, so users can access
// preferences directly via the constructor without having to create an instance
// first.
Logger.__proto__ = Logger.prototype;


