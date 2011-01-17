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
 * setPanel
 * 
 * @param
 */
var langsPrefsEntry = "extensions.semturkey.annotprops.langs";
var defaultLangPref = "extensions.semturkey.annotprops.defaultlang";

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("createProperty").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);
	document.getElementById("newValue").addEventListener("command",
			art_semanticturkey.onAccept, true);
	document.getElementById("newValue").focus();
	art_semanticturkey.setPanel();
};

art_semanticturkey.setPanel = function() {
	var langLbl = document.createElement("label");
	langLbl.setAttribute("id", "lblvalue");
	langLbl.setAttribute("value", "Insert Annotation language:");
	var row1 = document.createElement("row");
	row1.appendChild(langLbl);
	var langMenulist = document.createElement("menulist");
	langMenulist.setAttribute("id", "langMenu");
	var langMenupopup = document.createElement("menupopup");
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var langList = prefs.getCharPref(langsPrefsEntry).split(",");
	langList.sort();
	var langMenuitem = document.createElement("menuitem");
	langMenuitem.setAttribute('label', "no language");
	langMenuitem.setAttribute('id', "");
	langMenupopup.appendChild(langMenuitem);
	langMenuitem = document.createElement("menuitem");
	for (var i = 0; i < langList.length; i++) {
		langMenuitem.setAttribute('label', langList[i]);
		langMenuitem.setAttribute('id', langList[i]);
		langMenupopup.appendChild(langMenuitem);
		langMenuitem = document.createElement("menuitem");
	}
	var row2 = document.createElement("row");
	langMenulist.appendChild(langMenupopup);
	row2.appendChild(langMenulist);
	var boxrows = document.getElementById("boxrows");
	boxrows.appendChild(row1);
	boxrows.appendChild(row2);
	var defaultLang = prefs.getCharPref(defaultLangPref);
	langMenulist.selectedItem = document.getElementById(defaultLang);
	langMenupop.selectedItem = document.getElementById(defaultLang);
	if (window.arguments[0].predicatePropertyName == "rdfs:comment") {
		var propValue = document.getElementById("newValue");
		propValue.setAttribute("multiline", "true");
		propValue.setAttribute("wrap", "on");
		propValue.setAttribute("cols", "1");
		propValue.setAttribute("rows", "3");
	}
};

art_semanticturkey.onAccept = function() {
	var range=null;
	var type = "plainLiteral";
	var propValue = document.getElementById("newValue").value;
	try {
		var menu = document.getElementById("langMenu");
		var lang = menu.selectedItem.id;
		window.arguments[0].parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(window.arguments[0].sourceElementName,
						window.arguments[0].predicatePropertyName, propValue,
						range, type, lang);
		close();
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.onCancel = function() {
	window.arguments[0].oncancel = true;
	window.close();
};
