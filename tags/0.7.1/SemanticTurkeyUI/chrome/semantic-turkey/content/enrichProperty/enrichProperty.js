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

/** NScarpato */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Property.jsm",art_semanticturkey);

window.onload = function() {
	art_semanticturkey.setPanel();
	document.getElementById("checkAll").addEventListener("command",art_semanticturkey.showAllClasses,true);
	document.getElementById("ep_classesTree").addEventListener("click",
			art_semanticturkey.ep_classesTreeClick, true);
	document.getElementById("cancel").addEventListener("click",art_semanticturkey.onCancel, true);
	document.getElementById("Bind").addEventListener("click",art_semanticturkey.bind, true);
	document.getElementById("Add").addEventListener("click",art_semanticturkey.annotateInst, true);
	
	var predicatePropertyName = window.arguments[0].predicatePropertyName;
	try{
		var responseXML = art_semanticturkey.STRequests.Property.getRangeClassesTree(predicatePropertyName);
		if(responseXML.getElementsByTagName("Class").length == 0){
			document.getElementById("checkAll").checked = true;
			document.getElementById("checkAll").disabled = true;
		}
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	art_semanticturkey.showAllClasses();
};
art_semanticturkey.ep_classesTreeClick = function(e) {
	var ep_tree = document.getElementById("ep_classesTree");
	var ep_list = document.getElementById("ep_IndividualsList");
	var parentWindow = window.arguments[0].parentWindow;
	parentWindow.art_semanticturkey.classesTreeClick(e,ep_tree,ep_list);
};
/**
 * @author NScarpato 10/03/2008 setPanel
 * @param {}
 */
art_semanticturkey.setPanel = function() {
	document.getElementById("properties").setAttribute("title", window.arguments[0].winTitle);
	if (window.arguments[0].action != null) {
		var sourceElementName = window.arguments[0].sourceElementName;
		document.getElementById('Bind').setAttribute("label", "Create and add Property Value");
		document.getElementById('Add').setAttribute("label", "Add Existing Property Value");
	}
	// NScarpato 24/05/2007 add subtree
	/*art_semanticturkey.HttpMgr.GETP("http://"+server+":1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName="
			+ predicatePropertyName);*/
	//TODO è stata spostata in utilities e gli vanno passati albero e lista 
	//searchFocus("Class", objectClsName, "", "");
};

// NScarpato 24/05/2007 add new annotation AND new instance bind function ("bind
// to new individual for selected class")
art_semanticturkey.bind = function() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		AnnotFunctionList=annComponent.wrappedJSObject.getList();
		if( AnnotFunctionList[defaultAnnotFun] != null){
			var tree = document.getElementById("ep_classesTree");
			var responseXML = AnnotFunctionList[defaultAnnotFun]["listDragDropBind"](window,tree);
			if(responseXML != null){
				var mainTree = window.arguments[0].parentWindow.document.getElementById("classesTree");
				close();
				window.arguments[0].parentWindow.art_semanticturkey.classDragDrop_RESPONSE(responseXML,mainTree,false);
			}	
		}else{
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(null,defaultAnnotFun+" annotation type not registered ",defaultAnnotFun+" not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate","bookmarking");
		}
		close();
};
// NScarpato 28/05/2007 add sole annotate function ("add new annotation for
// selected instance")
// NScarpato 10/03/2008 add annotate function "addExistingPropValue"
art_semanticturkey.annotateInst = function(){
	var myList = document.getElementById("ep_IndividualsList");
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		AnnotFunctionList=annComponent.wrappedJSObject.getList();
		if( AnnotFunctionList[defaultAnnotFun] != null){
			AnnotFunctionList[defaultAnnotFun]["listDragDropAnnotateInst"](window,myList);
		}else{
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(null,defaultAnnotFun+" annotation type not registered ",defaultAnnotFun+" not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate","bookmarking");
		}
		close();
};

art_semanticturkey.showAllClasses = function() {
	var sel = document.getElementById("checkAll");
	if (sel.getAttribute("checked")) {
		var treeChildren = document.getElementById("ep_classesTree").getElementsByTagName('treechildren')[0];
		var treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		try{
			var responseXML = window.arguments[0].parentWindow.art_semanticturkey.STRequests.Cls.getClassTree();
			art_semanticturkey.getClassTree_RESPONSE(responseXML,document.getElementById("ep_rootClassTreeChildren"));
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		var treeChildren = document.getElementById("ep_classesTree").getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		var predicatePropertyName = window.arguments[0].predicatePropertyName;
		
		try{
			var responseXML = art_semanticturkey.STRequests.Property.getRangeClassesTree(predicatePropertyName);
			art_semanticturkey.getClassTree_RESPONSE(responseXML,document.getElementById("ep_rootClassTreeChildren"));
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};
art_semanticturkey.onCancel = function() {
	window.arguments[0].oncancel = true;
	window.close();
};
