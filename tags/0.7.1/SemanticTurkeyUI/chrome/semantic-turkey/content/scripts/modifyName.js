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
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

window.onload = function() {
	document.getElementById("renameResource").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("name").addEventListener("command",
			art_semanticturkey.onAccept, true);
	document.getElementById("name").focus();			
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
};

art_semanticturkey.onAccept = function() {
	var parentWindow = window.arguments[0].parentWindow;
	var oldResourceName = window.arguments[0].resourceName;
	var newResourceName = document.getElementById("name").value;
	try{
		var responseXML = parentWindow.art_semanticturkey.STRequests.ModifyName.renameResource(
				newResourceName,
				oldResourceName);
		parentWindow.art_semanticturkey.renameResource_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
};
art_semanticturkey.onClose = function() {
	window.arguments[0].parentWindow.art_semanticturkey.Logger
			.debug("dentro onCLose");
	close();
};
/**
 * addClassFire
 *//*
art_semanticturkey.addClassFire = function() {
	var textbox = document.getElementById("name");
	var classAdedded = new classAddedClass(textbox.value, name, parameters);
	art_semanticturkey.evtMgr.fireEvent("classAdded", classAdedded);
	close();
}*/