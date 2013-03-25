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
if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stservices/SERVICE_Individual.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

// netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

window.onload = function() {
	var event = window.arguments[0].event;
	var handlers = window.arguments[0].handlers;

	// add the eventlistener for the buttons
	document.getElementById("Ok").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("Cancel").addEventListener("click", art_semanticturkey.onCancel, true);

	// get the functions for the selected family for the event drag'n'drop over
	// instance

	// get the groupbox
	var groupbox = document.getElementById("group");

	for ( var i = 0; i < handlers.length; i++) {
		// if function is enabled show it else skip
		var radiobox = document.createElement("radio");
		radiobox.setAttribute("id", i);
		radiobox.setAttribute("label", handlers[i].getLabel());
		groupbox.appendChild(radiobox);
	}

};

// actions performed by Ok button
art_semanticturkey.onAccept = function() {

	var sitem = document.getElementById("group").selectedItem;
	// get the id of the item selected: used it to address the function
	var sindex = sitem.getAttribute("id");

	var event = window.arguments[0].event;
	var handlers = window.arguments[0].handlers;
	var parentWindow = window.arguments[0].parentWindow;
	var fun = handlers[sindex].getBody();
	
	var family = window.arguments[0].family;
	fun.call(family, event, parentWindow);

	close();
};

// when cancel button is pressed close the window
art_semanticturkey.onCancel = function() {
	close();
};