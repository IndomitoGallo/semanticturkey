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
var langsPrefsEntry="extensions.semturkey.annotprops.langs";
var defaultLangPref="extensions.semturkey.annotprops.defaultlang";
 
if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/stEvtMgr.jsm");
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);

window.onload = function() {

	document.getElementById("addConcept").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("conceptName").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.onClose, true);
	
	document.getElementById("conceptName").focus();

	art_semanticturkey.setPanel();

};

art_semanticturkey.setPanel = function() {
	var type = window.arguments[0].type;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var preferredLabelLanguageMenuList  = document.getElementById("preferredLabelLanguageMenuList");
	var rdfsLabelLanguageMenuList  = document.getElementById("rdfsLabelLanguageMenuList");
	
	var rdfsLabelLanguageMenupopup = document.getElementById("rdfsLabelLanguageMenupopup");
	var preferredLabelLanguageMenupopup = document.getElementById("preferredLabelLanguageMenupopup");	
	var langList = prefs.getCharPref(langsPrefsEntry).split(",");
	langList.sort();
	
	
	if(type == 'narrower') {
		var tmp = "";
		if(window.arguments[0].conceptLabel != ""){
			var tmp = window.arguments[0].conceptLabel;
		} else {
			var tmp = window.arguments[0].concept;	
		}
		document.getElementById("panelTitle").label = " - Add new Narrower Concept for " + tmp +" - ";
	} else if(type == 'broader') {
		var tmp = "";
		if(window.arguments[0].conceptLabel != ""){
			var tmp = window.arguments[0].conceptLabel;
		} else {
			var tmp = window.arguments[0].concept;	
		}		
		document.getElementById("panelTitle").label = " - Add new Broader Concept for " + tmp +" - ";
	}
	

	var defaultLang=prefs.getCharPref(defaultLangPref);
	art_semanticturkey.Logger.debug('Default language: ' + defaultLang);
		
	// load rdfs:label languages
	var langMenuitem = document.createElement("menuitem");
	var menuseparator = document.createElement("menuseparator");
	langMenuitem.setAttribute('label', "no language");
	langMenuitem.setAttribute('id', "no language");
	rdfsLabelLanguageMenupopup.appendChild(langMenuitem);
	rdfsLabelLanguageMenupopup.appendChild(menuseparator);			
	langMenuitem = document.createElement("menuitem");
	var selectedIndex = -1;
	for (var i = 0; i < langList.length; i++) {
		langMenuitem.setAttribute('label', langList[i]);
		langMenuitem.setAttribute('id', langList[i]);
		rdfsLabelLanguageMenupopup.appendChild(langMenuitem);
		langMenuitem = document.createElement("menuitem");
		if(defaultLang == langList[i]){
			selectedIndex = i;
		}
	}
	rdfsLabelLanguageMenuList.selectedIndex=selectedIndex+2;
	
	// load skos:preferredLabel languages
	var langMenuitem = document.createElement("menuitem");
	var menuseparator = document.createElement("menuseparator");
	langMenuitem.setAttribute('label', "no language");
	langMenuitem.setAttribute('id', "no language");
	preferredLabelLanguageMenupopup.appendChild(langMenuitem);
	preferredLabelLanguageMenupopup.appendChild(menuseparator);
	var selectedIndex = -1;
	langMenuitem = document.createElement("menuitem");
	for (var i = 0; i < langList.length; i++) {
		langMenuitem.setAttribute('label', langList[i]);
		langMenuitem.setAttribute('id', langList[i]);
		preferredLabelLanguageMenupopup.appendChild(langMenuitem);	
		langMenuitem = document.createElement("menuitem");
		if(defaultLang == langList[i]){
			selectedIndex = i;
		}
	}
	preferredLabelLanguageMenuList.selectedIndex=selectedIndex+2;

};

art_semanticturkey.onAccept = function() {	
	var parentWindow = window.arguments[0].parentWindow;
	var humanReadableMode = parentWindow.art_semanticturkey.getHumanReadableMode();
	var type = window.arguments[0].type;
	var schemeName = window.arguments[0].scheme;
	var preferredLabelLanguageMenuList = document.getElementById("preferredLabelLanguageMenuList");
	var rdfsLabelLanguageMenuList = document.getElementById("rdfsLabelLanguageMenuList");
	var relatedConcept = window.arguments[0].relatedConcept;
	var newConcept = document.getElementById("conceptName").value;
	if(newConcept.length == 0){
		alert('Please, select a valid concept name!');
		return;
	}
	
 
	var rdfsLabelLanguage =rdfsLabelLanguageMenuList.selectedItem.id;
	var rdfsLabel = document.getElementById("rdfsLabel").value;
	if(rdfsLabelLanguage == "no language"){
		rdfsLabelLanguage = "";
	}
	
	var preferredLabelLanguage =preferredLabelLanguageMenuList.selectedItem.id;
	var preferredLabel = document.getElementById("preferredLabel").value;
	if(preferredLabelLanguage == "no language"){
		preferredLabelLanguage = "";
	}
	art_semanticturkey.Logger.debug('schemeName: ' + schemeName);
	
	if(type == 'narrower') {
		var responseXML = parentWindow.art_semanticturkey.STRequests.SKOS.createNarrowerConcept(newConcept,schemeName, relatedConcept, 
				rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage);
	} else if(type == 'broader') {
		var responseXML = parentWindow.art_semanticturkey.STRequests.SKOS.createBroaderConcept(newConcept,schemeName, relatedConcept, 
				rdfsLabel, rdfsLabelLanguage,preferredLabel,preferredLabelLanguage);		
	}
			
	art_semanticturkey.Logger.debug('Relation type: ' + type);

	close();

	if(type == 'narrower'){
		
		var dataElement = responseXML.getElementsByTagName('data')[0];
		var conceptList = dataElement.getElementsByTagName("concept");
		var objNewConcept = new Object();
		if(conceptList.length > 0){
			var label = conceptList[0].getAttribute("label");
			var name  = conceptList[0].getAttribute("name");

			// if human-readable mode... load label property otherwise load name property
			if(humanReadableMode == true && label.length > 0){
				objNewConcept.label = label;
			}else {
				objNewConcept.label = name;
			}			
			objNewConcept.label = name;
			objNewConcept.id = conceptList[0].getAttribute("id");
			objNewConcept.uri = conceptList[0].getAttribute("uri");
			objNewConcept.more = conceptList[0].getAttribute("more");		

		}
					
		var parentWindow = window.arguments[0].parentWindow;
		var obj = new Object();
		obj.newConcept = objNewConcept;
		obj.type = type;
		obj.scheme = schemeName;
		obj.treerow = window.arguments[0].treerow;
		obj.relatedConcept = relatedConcept;
		
		parentWindow.art_semanticturkey.evtMgr.fireEvent("conceptNarrowerAdded", obj);
	
	} else if(type == 'broader'){
		var parentWindow = window.arguments[0].parentWindow;
		var obj = new Object();
		obj.newConcept = newConcept;
		obj.type = type;
		obj.scheme = schemeName;
		obj.treerow = window.arguments[0].treerow;
		obj.relatedConcept = relatedConcept;
		parentWindow.art_semanticturkey.evtMgr.fireEvent("conceptBroaderAdded", obj);
	
	} else {
		art_semanticturkey.Logger.error('no event fired');
	}
};

art_semanticturkey.onClose = function() {
	
	close();
		
};
