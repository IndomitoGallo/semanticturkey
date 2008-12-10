/*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License");  you may not use this file except in compliance
  * with the License.  You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
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
  * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
  * Current information about SemanticTurkey can be obtained at 
  * http://semanticturkey.uniroma2.it
  *
  */
const langsPrefsEntry="extensions.semturkey.annotprops.langs";
const defaultLangsPrefsEntry="extensions.semturkey.annotprops.defaultlang";

/**
 * @author Noemi Scarpato 05/12/2008
 * Init preferences panel */
function populatePreferecesPanel() {
	//Annotation type option
		
	//Default Language option
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var defLang=prefs.getCharPref(defaultLangsPrefsEntry);
	var boxLang=document.getElementById("default_language_box");
	var txtLang=document.createElement("textbox");
	txtLang.setAttribute("value",defLang);
	txtLang.setAttribute("disabled","true");
	txtLang.setAttribute("id","default_languageST");
	txtLang.setAttribute("preference",defaultLangsPrefsEntry);
	var buttonModify=document.getElementById("changeDefault");
	boxLang.insertBefore(txtLang,buttonModify);
	
	//Available Languages option 
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var langList=prefs.getCharPref(langsPrefsEntry).split(",");
	var langlistbox=document.getElementById("languagesOption");
	var langListItem = document.createElement("listitem");	
	  	for ( var i = 0; i < langList.length; i++ )
  	{
	  	langListItem.setAttribute("label",langList[i]);
	  	langlistbox.appendChild(langListItem);
		var langListItem = document.createElement("listitem");
  	}
}

function changeDefaultLanguage() {
	parameters=new Object();
	var txtLang=document.getElementById("default_languageST");
	parameters.txt=txtLang;
	window.openDialog("chrome://semantic-turkey/content/availableLanguages.xul","_blank","modal=yes,resizable,centerscreen",parameters);
}
function addLanguage() {
	var newLang=prompt("Insert new language option", "");
	if(newLang != null){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var langList=prefs.getCharPref(langsPrefsEntry)	
		prefs.setCharPref(langsPrefsEntry,langList+","+newLang);
		var langlistbox=document.getElementById("languagesOption");
		var langListItem = document.createElement("listitem");	
		langListItem.setAttribute("label",newLang);
	  	langlistbox.appendChild(langListItem);
  	}
	close();
}