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

Components.utils.import("resource://stservices/SERVICE_SKOS.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

var langsPrefsEntry="extensions.semturkey.annotprops.langs";
var defaultLangPref="extensions.semturkey.annotprops.defaultlang";
var humanReadablePref = "extensions.semturkey.skos.humanReadable";

/**
 * Set the human-readable mode
 * @author Luca Mastrogiovanni <luca.mastrogiovanni@caspur.it>
 */
art_semanticturkey.setHumanReadableMode = function (value){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	prefs.setBoolPref(humanReadablePref, value); // set a pref (accessibility.typeaheadfind)
};

/**
 * Return the human-readable mode
 * @author Luca Mastrogiovanni <luca.mastrogiovanni@caspur.it>
 */
art_semanticturkey.getHumanReadableMode = function (){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return prefs.getBoolPref(humanReadablePref);
};

/**
 * Return the default language, if it's missing return blank
 */
art_semanticturkey.getDefaultLanguage = function (){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	return prefs.getCharPref(defaultLangPref);
};

/**
 * This method load the schemes in the specified menuList
 */
art_semanticturkey.loadSchemeList = function(menupopup) {
	try{		
		// load schemes...		
		var responseXML = art_semanticturkey.STRequests.SKOS.getAllSchemesList(art_semanticturkey.getDefaultLanguage());
		art_semanticturkey.loadSchemeList_RESPONSE(responseXML,menupopup);
	}catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.loadSchemeList_RESPONSE = function(responseXML,menupopup) {
	var responseList = responseXML.getElementsByTagName('Scheme');
	for ( var i = 0; i < responseList.length; i++) {
		var schemeName = responseList[i].getAttribute("name");
		var schemeUri = responseList[i].getAttribute("uri");
		var schemeLabel = responseList[i].getAttribute("label");
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id", schemeUri);
		menuitem.setAttribute("name", schemeName);
		// if human-readable mode... load label property otherwise load name property
		if(art_semanticturkey.getHumanReadableMode() == true && schemeLabel.length > 0){
			menuitem.setAttribute("label", schemeLabel);
		}else {
			//menuitem.setAttribute("label",schemeName);
			menuitem.setAttribute("label",schemeUri);
		}
		menupopup.appendChild(menuitem);
	}		
};