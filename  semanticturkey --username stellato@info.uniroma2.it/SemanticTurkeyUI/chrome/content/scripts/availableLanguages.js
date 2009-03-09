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
const langsPrefsEntry = "extensions.semturkey.annotprops.langs";
const defaultLangsPrefsEntry = "extensions.semturkey.annotprops.defaultlang";

function populatePanel() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var langList = prefs.getCharPref(langsPrefsEntry).split(",");
	var langlistbox = document.getElementById("languages");
	var langListItem = document.createElement("listitem");
	langList.sort();
	for (var i = 0; i < langList.length; i++) {
		langListItem.setAttribute("label", langList[i]);
		langlistbox.appendChild(langListItem);
		langListItem = document.createElement("listitem");
	}
}

function accept() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var selectedItem = document.getElementById("languages").selectedItem;
		newDefLang = selectedItem.getAttribute("label");
		prefs.setCharPref(defaultLangsPrefsEntry, newDefLang);
		var txt = window.arguments[0].txt;
		txt.value = newDefLang;	
	close();
}