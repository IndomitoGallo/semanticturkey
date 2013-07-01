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
	document.getElementById("createClass").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("name").addEventListener("command",
			art_semanticturkey.onAccept, true);

	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
	
	document.getElementById("name").focus();
};

art_semanticturkey.onAccept = function() {
	var type = window.arguments[0].type;
	var parentWindow = window.arguments[0].parentWindow;
	var newClassName = document.getElementById("name").value;
	var responseArray;
	try{
		if (type == "rootClass") {
			responseArray =parentWindow.art_semanticturkey.STRequests.Cls
					.addClass(newClassName);
		} else {
			var parentTreecell = window.arguments[0].parentTreecell;
			var numInst = parentTreecell.getAttribute("numInst");
			var parentName = parentTreecell.getAttribute("label");
			if (numInst > 0) {
				parentName = parentName.substring(0, parentName.lastIndexOf('('));
			}
			responseArray = parentWindow.art_semanticturkey.STRequests.Cls.addSubClass(
					newClassName, parentName);
		}
		parentWindow.art_semanticturkey.addClass_RESPONSE(responseArray);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
	
};
art_semanticturkey.onClose = function() {
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