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
const annPrefsEntry = "extensions.semturkey.extpt.annotateList";
const defaultAnnPrefsEntry = "extensions.semturkey.extpt.annotate";

/**
 * @author Scarpato Noemi 05/12/2008 Init preferences panel
 */
function populatePreferecesPanel() {
	document.getElementById("pane1").setAttribute("selected",true);
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	// Available Annotation options
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.info.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	var annList=annComponent.wrappedJSObject.getList();
	var annlistbox = document.getElementById("annotationOptions");
	var annListItem = document.createElement("listitem");
	for (var annFunName in annList) {  
		annListItem.setAttribute("label", annFunName);
		annlistbox.appendChild(annListItem);
		annListItem = document.createElement("listitem");
	}
	// Default Annotation option
	var defAnn = prefs.getCharPref(defaultAnnPrefsEntry);
	var boxAnn = document.getElementById("default_ann_box");
	var txtAnn = document.createElement("textbox");
	txtAnn.setAttribute("value", defAnn);
	txtAnn.setAttribute("disabled", "true");
	txtAnn.setAttribute("id", "default_AnnST");
	txtAnn.setAttribute("preference", defaultLangsPrefsEntry);
	var buttonModifyAnn = document.getElementById("changeDefaultAnn");
	boxAnn.insertBefore(txtAnn, buttonModifyAnn);

	// Default Language option
	var defLang = prefs.getCharPref(defaultLangsPrefsEntry);
	var boxLang = document.getElementById("default_language_box");
	var txtLang = document.createElement("textbox");
	txtLang.setAttribute("value", defLang);
	txtLang.setAttribute("disabled", "true");
	txtLang.setAttribute("id", "default_languageST");
	txtLang.setAttribute("preference", defaultLangsPrefsEntry);
	var buttonModify = document.getElementById("changeDefault");
	boxLang.insertBefore(txtLang, buttonModify);

	// Available Languages options
	var langList = prefs.getCharPref(langsPrefsEntry).split(",");
	var langlistbox = document.getElementById("languagesOption");
	var langListItem = document.createElement("listitem");
	langList.sort();
	for (var y = 0; y < langList.length; y++) {
		langListItem.setAttribute("label", langList[y]);
		langlistbox.appendChild(langListItem);
		langListItem = document.createElement("listitem");
	}
}

function changeDefaultLanguage() {
	parameters = new Object();
	var txtLang = document.getElementById("default_languageST");
	parameters.txt = txtLang;
	window.openDialog(
			"chrome://semantic-turkey/content/availableLanguages.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
}

function changeDefaultAnnotation() {
	if(document.getElementById("pane1").selected){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var selectedItem = document.getElementById("annotationOptions").selectedItem;
		if(selectedItem!=null){
			newDefAnn = selectedItem.getAttribute("label");
			prefs.setCharPref(defaultAnnPrefsEntry, newDefAnn);
			var txtAnn = document.getElementById("default_AnnST");
			txtAnn.value = newDefAnn;
		}
	}else{
		close();
	}
	/*parameters = new Object();
	var txtAnn = document.getElementById("default_AnnST");
	parameters.txt = txtAnn;
	
	window
			.openDialog(
					"chrome://semantic-turkey/content/availableAnnotationFunctions.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);*/
}

function addLanguage() {
	var newLang = prompt("Insert new language option", "");
	if (newLang != null) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var langList = prefs.getCharPref(langsPrefsEntry).split(",");
		langList=langList.concat(newLang);
		prefs.setCharPref(langsPrefsEntry,langList);
		var langlistbox = document.getElementById("languagesOption");
		while (langlistbox.hasChildNodes()) {
				langlistbox.removeChild(langlistbox.lastChild);
			}
		var langListItem = document.createElement("listitem");
		langList.sort();
		for (var y = 0; y < langList.length; y++) {
			langListItem.setAttribute("label", langList[y]);
			langlistbox.appendChild(langListItem);
			langListItem = document.createElement("listitem");
		}
		/*
		 * prefs.setCharPref(langsPrefsEntry, langList + "," + newLang); var
		 * langlistbox = document.getElementById("languagesOption"); var
		 * langListItem = document.createElement("listitem");
		 * langListItem.setAttribute("label", newLang);
		 * langlistbox.appendChild(langListItem);
		 */
	}
	//close();
}

function removeLanguage() {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var selectedItem = document.getElementById("languagesOption").selectedItem;
		var selectIndex=document.getElementById("languagesOption").selectedIndex;
		remLang = selectedItem.getAttribute("label");
		var langList = prefs.getCharPref(langsPrefsEntry).split(",");
		langList.sort();
		var risp = confirm("Do you really want remove "+remLang+" language?");
		if(risp){
			var langList=prefs.getCharPref(langsPrefsEntry).split(",");
			langList.sort();
			langList.splice(selectIndex,1);
			prefs.setCharPref(langsPrefsEntry,langList);
			var langlistbox = document.getElementById("languagesOption");
			while (langlistbox.hasChildNodes()) {
				langlistbox.removeChild(langlistbox.lastChild);
			}
			var langListItem = document.createElement("listitem");
			langList.sort();
			for (var y = 0; y < langList.length; y++) {
				langListItem.setAttribute("label", langList[y]);
				langlistbox.appendChild(langListItem);
				langListItem = document.createElement("listitem");
			}
		}
}