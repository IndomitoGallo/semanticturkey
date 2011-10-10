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
Components.utils.import("resource://stservices/SERVICE_Property.jsm", art_semanticturkey);
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

/**
 * Clear the tree specified
 */
art_semanticturkey.clearTree = function (treeChildren) {
	var rootConceptsTreeChildren = treeChildren;
	while (rootConceptsTreeChildren.hasChildNodes()) {
		rootConceptsTreeChildren.removeChild(rootConceptsTreeChildren.lastChild);
	}
};

art_semanticturkey.populateTree = function(responseXML,rootNode) {
	var dataElement = responseXML.getElementsByTagName('data')[0];
	var conceptList = dataElement.getElementsByTagName("concept");
	var i = 0;
	
	for(i=0; i<conceptList.length;i++){
		var conceptNode = conceptList[i];
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		var label = conceptNode.getAttribute("label");
		var name  = conceptNode.getAttribute("name");
		
		// if human-readable mode... load label property otherwise load name property
		if(art_semanticturkey.getHumanReadableMode() == true && label.length > 0){
			tc.setAttribute("label", label);
		}else {
			tc.setAttribute("label",name);
		}
		
		tc.setAttribute("name", name);
		tc.setAttribute("id", conceptNode.getAttribute("id"));
		tc.setAttribute("uri", conceptNode.getAttribute("uri"));
		tc.setAttribute("more", conceptNode.getAttribute("more"));		
		tr.appendChild(tc);
		
		var ti = document.createElement("treeitem");
		ti.setAttribute("conceptName", conceptNode.getAttribute("name"));
		ti.appendChild(tr);
		
		
		var tch = document.createElement("treechildren");
		rootNode.appendChild(ti);
		var more = conceptNode.getAttribute("more");
		if (more == "1") {
			ti.appendChild(tch);
			ti.setAttribute("container", true);
			ti.setAttribute("open", false);
		} else {
			ti.setAttribute("container", false);
		}
	}	
};

/**
 * Load narrower concept
 */
/*
art_semanticturkey.loadNarrower = function(event,tree) {
	var action = "null";
	var treeitem;
	if(event.type == "click"){
		var row = {};
		var col = {};
		var part = {};
		
		alert('event.clientY:' + event.clientY);
		alert('event.clientX:' + event.clientX);
		tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
		treeitem = tree.contentView.getItemAtIndex(row.value);
		
		var isContainer =  treeitem.getAttribute("container");
		if(isContainer == "false"){
			return;
		}
		var isTwisty = (part.value == "twisty");
		
		if(isTwisty == false){
			//the user did not click on the twisty, so he does not want the sub classes
			return;
		}
		var isOpen = treeitem.getAttribute("open");
		
		if(isOpen == "true"){
			action = "emptySubTree";
		}
		else if(isOpen == "false"){
			action = "loadSubTree";
		}
	}else{
		return
	}
	
	//do the requested action
	var treeChildren = treeitem.getElementsByTagName("treechildren")[0];
	
	if(action == "loadSubTree"){
		
		// EMPTY TREE, just to be extra sure
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}		
		var conceptName = treeitem.getAttribute("conceptName");
		var responseXML=art_semanticturkey.STRequests.SKOS.getNarrowerConcepts(conceptName,art_semanticturkey.getDefaultLanguage());
		art_semanticturkey.populateTree(responseXML,treeitem);
		
	} 	else if(action == "emptySubTree"){
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
	}
};
*/

art_semanticturkey.loadNarrower = function(event,item) {
	var action = "null";
	var treeitem;
	if(event.type == "click"){
		treeitem = item;
		
		var isContainer =  treeitem.getAttribute("container");
		if(isContainer == "false"){
			return;
		}
		var isOpen = treeitem.getAttribute("open");
		
		if(isOpen == "true"){
			action = "emptySubTree";
		}
		else if(isOpen == "false"){
			action = "loadSubTree";
		}
	}else{
		return
	}
	
	//do the requested action
	var treeChildren = treeitem.getElementsByTagName("treechildren")[0];
	if(action == "loadSubTree"){
		// EMPTY TREE, just to be extra sure
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}		
		var conceptName = treeitem.getAttribute("conceptName");
		var responseXML=art_semanticturkey.STRequests.SKOS.getNarrowerConcepts(conceptName,art_semanticturkey.getDefaultLanguage());
		art_semanticturkey.populateTree(responseXML,treeChildren);
	} 	else if(action == "emptySubTree"){
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
	}
};
