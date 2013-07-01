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
 * NScarpato 16/10/2007 File che contiene le funzioni di Riempimento del
 * Pannello create Property
 */
//netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
var ptype = "";

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

window.onload = function() {
	var parentWindow = window.arguments[0].parentWindow;
	var propType = window.arguments[0].propType;
	art_semanticturkey.initializePanel(propType);
	document.getElementById("createProperty").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("name").addEventListener("command",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
	
	document.getElementById("name").focus();
};
/**
 * Funzione che crea gli elementi di createProperty in base al tipo di import
 * selezionato
 */
art_semanticturkey.initializePanel = function(propType) {
	var img = document.createElement("image");
	if (propType.indexOf("ObjectProperty") != -1) {
		img.setAttribute("src", "chrome://semantic-turkey/skin/images/propObject20x20.png");
	} else if (propType.indexOf("DatatypeProperty") != -1) {
		img.setAttribute("src", "chrome://semantic-turkey/skin/images/propDatatype20x20.png");
	} else if (propType.indexOf("AnnotationProperty") != -1) {
		img.setAttribute("src", "chrome://semantic-turkey/skin/images/propAnnotation20x20.png");
	} else if (propType.indexOf("Property") != -1) {
		img.setAttribute("src", "chrome://semantic-turkey/skin/images/prop20x20.png");
	}
	var lbl = document.createElement("label");
	lbl.setAttribute("value", "Create " + propType + " Form");
	lbl.setAttribute("class", "header");
	var titleBox = document.getElementById("title");
	img.setAttribute("flex", "0");
	titleBox.appendChild(img);
	titleBox.appendChild(lbl);
};

art_semanticturkey.onAccept = function() {
	var parentWindow = window.arguments[0].parentWindow;
	var tree = window.arguments[0].tree;
	var parentTreecell = window.arguments[0].parentTreecell;
	var type = window.arguments[0].type;
	var propType = window.arguments[0].propType;
	var textboxName = document.getElementById("name").value;
	var responseArray;
	try{
		if (type == "property") {
			responseArray = parentWindow.art_semanticturkey.STRequests.Property.addProperty(
					textboxName, propType);
		} else if (type == "subProperty") {
			var selPropName = window.arguments[0].selPropName;
			responseArray = parentWindow.art_semanticturkey.STRequests.Property.addSubProperty(
					textboxName, propType,
					selPropName);
	}
		parentWindow.art_semanticturkey.addProperty_RESPONSE(responseArray);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	/*
	 * TODO make update of tree instead total refresh of tree
	 * art_semanticturkey.HttpMgr .GETP("http://" + server +
	 * ":1979/semantic_turkey/resources/stserver/STServer?service=refresh&update=yes");
	 */
	close();
};

art_semanticturkey.onClose = function() {
	close();
};
