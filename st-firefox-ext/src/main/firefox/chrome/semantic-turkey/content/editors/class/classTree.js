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
Components.utils.import("resource://stservices/SERVICE_Cls.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function() {
	//netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);
	try {
		var responseXML = art_semanticturkey.STRequests.Cls.getClassTree();
		art_semanticturkey.getClassTreePanel_RESPONSE(responseXML, document
				.getElementById("rootClassTreePanelChildren"));
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

	if (!window.arguments[0].onAccept)
		window.arguments[0].onAccept = function onSTAccept() {
			var tree = document.getElementById("classesTreePanel");
			var range = tree.view.selection.getRangeCount();
			if (range <= 0) {
				alert("Please Select a Class");
				return;
			}
			var currentelement = tree.treeBoxObject.view
					.getItemAtIndex(tree.currentIndex);
			var myTreeSelectedClass = currentelement.getAttribute("className");
			if (window.arguments[0].source == "domain") {
				window.arguments[0].domainName = myTreeSelectedClass;
			} else if (window.arguments[0].source == "range") {
				window.arguments[0].rangeName = myTreeSelectedClass;
			} else {
				window.arguments[0].selectedClass = myTreeSelectedClass;
			}
			close();
		};
	document.getElementById("accept").addEventListener("click",
			window.arguments[0].onAccept, true);

};
art_semanticturkey.getClassTreePanel_RESPONSE = function(responseElement,
		rootTreechildren) {
	var rootTreechildren = rootTreechildren;
	if (typeof rootTreechildren == 'undefined')
		rootTreechildren = document.getElementById('rootClassTreeChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var classList = dataElement.childNodes;
	for ( var i = 0; i < classList.length; i++) {
		if (classList[i].nodeType == 1) {
			art_semanticturkey.parsingClass(classList[i], rootTreechildren,
					true);
		}
	}
};

art_semanticturkey.onCancel = function() {
	window.arguments[0].domainName = "none domain selected";
	close();
};