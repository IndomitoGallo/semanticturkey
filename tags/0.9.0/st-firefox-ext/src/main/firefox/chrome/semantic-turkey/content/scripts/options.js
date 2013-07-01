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
const
langsPrefsEntry = "extensions.semturkey.annotprops.langs";
const
defaultLangPrefsEntry = "extensions.semturkey.annotprops.defaultlang";
const
annPrefsEntry = "extensions.semturkey.extpt.annotateList";
const
defaultAnnPrefsEntry = "extensions.semturkey.extpt.annotate";

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);

art_semanticturkey.init = function() {
	if (art_semanticturkey.ST_started.getStatus() == "true") {
		document.getElementById("familyDeck").selectedIndex = 1;

		var familyMap = art_semanticturkey.annotation.AnnotationManager.getFamilies();

		var annotationFamilyOptionsElement = document.getElementById("annotationFamilyOptions");

		for ( var familyId in familyMap) {
			var fItem = document.createElement("listitem");
			fItem.setAttribute("label", familyMap[familyId].getName());
			fItem.setAttribute("value", familyId);
			// for each family, add the eventlistener for open the options2
			// window
			fItem.addEventListener("dblclick", art_semanticturkey.familyClick, false);
			annotationFamilyOptionsElement.appendChild(fItem);
		}

		var defAnnId = art_semanticturkey.Preferences.get(defaultAnnPrefsEntry, "");
		var defaultAnnotationFamilyElement = document.getElementById("defaultAnnotationFamily");
		defaultAnnotationFamilyElement.setAttribute("value", familyMap[defAnnId] ? familyMap[defAnnId]
				.getName() : "undefined");
	}

	var defLang = art_semanticturkey.Preferences.get(defaultLangPrefsEntry, "en");
	var defaultLanguageElement = document.getElementById("defaultLanguage");
	defaultLanguageElement.setAttribute("value", defLang);

	var langList = art_semanticturkey.Preferences.get(langsPrefsEntry, "").split(",");
	var languageOptionsElement = document.getElementById("languageOptions");
	langList.sort();
	for ( var y = 0; y < langList.length; y++) {
		var langListItem = document.createElement("listitem");
		langListItem.setAttribute("label", langList[y]);
		langListItem.setAttribute("value", langList[y]);
		languageOptionsElement.appendChild(langListItem);
	}

	document.getElementById("changeDefaultLanguage").addEventListener("command",
			art_semanticturkey.changeDefaultLanguage);
	document.getElementById("addLanguage").addEventListener("command", art_semanticturkey.addLanguage);
	document.getElementById("removeLanguage").addEventListener("command", art_semanticturkey.removeLanguage);

	document.getElementById("changeDefaultAnnotationFamily").addEventListener("command",
			art_semanticturkey.changeDefaultAnnotationFamily);

	document.getElementById("acceptButton").addEventListener("command", function() {
		document.documentElement.acceptDialog();
	}, false);
	document.getElementById("cancelButton").addEventListener("command", function() {
		document.documentElement.cancelDialog();
	}, false);

	document.addEventListener("dialogaccept", art_semanticturkey.onAccept, false);
	document.addEventListener("dialogcancel", art_semanticturkey.onCancel, false);
};

art_semanticturkey.onAccept = function(event) {
	var defaultLanguage = document.getElementById("defaultLanguage").getAttribute("value");

	var langList = "";
	var languageOptions = document.getElementById("languageOptions");
	for ( var i = 0; i < languageOptions.getRowCount(); i++) {
		if (i != 0) {
			langList = langList + ",";
		}

		langList = langList + languageOptions.getItemAtIndex(i).getAttribute("value");
	}

	art_semanticturkey.Preferences.set(defaultLangPrefsEntry, defaultLanguage);
	art_semanticturkey.Preferences.set(langsPrefsEntry, langList);
};

art_semanticturkey.onCancel = function(event) {
	// Nothing to do
};

art_semanticturkey.changeDefaultLanguage = function() {
	var selectedLangElement = document.getElementById("languageOptions").selectedItem;

	if (selectedLangElement != null) {
		document.getElementById("defaultLanguage").setAttribute("value",
				selectedLangElement.getAttribute("label"));
	} else {
		alert("You must select a language!");
	}
};

art_semanticturkey.addLanguage = function() {
	var newLang = prompt("Insert new language option", "");
	if (newLang != null) {
		var langlistbox = document.getElementById("languageOptions");

		var i = 0;

		for (; i < langlistbox.getRowCount(); i++) {
			var item = langlistbox.getItemAtIndex(i);

			if (newLang < item.getAttribute("value")) {
				break;
			}
		}

		langlistbox.insertItemAt(i, newLang, newLang);
	}
};

art_semanticturkey.removeLanguage = function() {
	var languageOptions = document.getElementById("languageOptions");
	var selectedItem = languageOptions.selectedItem;
	var selectedIndex = languageOptions.selectedIndex;

	if (selectedItem != null) {

		var remLang = selectedItem.getAttribute("label");
		var risp = confirm("Do you really want remove " + remLang + " language?");
		if (risp) {
			languageOptions.removeItemAt(selectedIndex);
		}

	} else {
		alert("You must select a language!");
	}
};

art_semanticturkey.changeDefaultAnnotationFamily = function() {
	var selectedFamilyItem = document.getElementById("annotationFamilyOptions").selectedItem;
	if (selectedFamilyItem != null) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var newDefAnnFamilyId = selectedFamilyItem.getAttribute("value");
		prefs.setCharPref(defaultAnnPrefsEntry, newDefAnnFamilyId);
		var newDefAnnFamily = selectedFamilyItem.getAttribute("label");
		var defaultAnnotationFamilyElement = document.getElementById("defaultAnnotationFamily");
		defaultAnnotationFamilyElement.setAttribute("value", newDefAnnFamily);
	} else {
		alert("You must select an annotation family!");
	}
};

// function that is called when double click the name of a family
// it opens options2 and pass the name of the selected family
art_semanticturkey.familyClick = function(event) {
	var selectedItem = event.target;
	if (selectedItem != null) {
		var annotationFamilyName = selectedItem.getAttribute("value");
		var parameters = new Object();
		parameters.annotationFamilyId = annotationFamilyName;
		window.openDialog("chrome://semantic-turkey/content/options2.xul", "_blank",
				"modal=yes,resizable,centerscreen", parameters);
	}
};

window.addEventListener("load", art_semanticturkey.init, false);