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
//netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

art_semanticturkey.associateEventsOnIndividualGraphicElements = function() {

	document.getElementById("IndividualsList").addEventListener("dblclick",
			art_semanticturkey.listdblclick, true);

	//document.getElementById("menuItemIndividualGraph").addEventListener(
	//		"command", art_semanticturkey.partialGraph, true);

	document.getElementById("menuItemWebLinks").addEventListener("command",
			art_semanticturkey.getWebLinks, true);
	document.getElementById("menuItemRenameIndividual").addEventListener("command",
			art_semanticturkey.renameIndividual, true);
	document.getElementById("menuItemRemoveIndividual").addEventListener(
			"command", art_semanticturkey.removeIndividual, true);

	document.getElementById("clipmenulist").addEventListener("popuping",
			art_semanticturkey.showHideItemsList, true);

};

// open WebLinks dialog
art_semanticturkey.getWebLinks = function() {
	var list = document.getElementById('IndividualsList');
	/*
	 * var windowManager =
	 * Components.classes['@mozilla.org/appshell/window-mediator;1']
	 * .getService(Components.interfaces.nsIWindowMediator); var topWindowOfType =
	 * windowManager .getMostRecentWindow("navigator:browser"); var tabWin =
	 * topWindowOfType.gBrowser.selectedBrowser.currentURI.spec;
	 */
	var instanceName = list.selectedItem.label;
	var parameters = new Object();
	parameters.instanceName = instanceName;
	window.openDialog("chrome://semantic-turkey/content/class/webLinks.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters);
};
/**
 * @author NScarpato ATurbati 09-10-2009
 * @description remove selected individual
 */
art_semanticturkey.removeIndividual = function() {
	var list = document.getElementById("IndividualsList");
	var instanceName = list.selectedItem.label;
	try {
		var responseURI = art_semanticturkey.STRequests.Delete
				.removeInstance(instanceName);
		art_semanticturkey.removeInstance_RESPONSE(responseURI);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};
/**
 * Remove Individual event handler
 */
art_semanticturkey.removeInstance_RESPONSE = function(responseURI) {
	var list = document.getElementById("IndividualsList");
	var parentClassName = list.getElementsByTagName('listheader')[0]
			.getAttribute("parentCls");
	var removedIndividualName = responseURI.getShow();

	var listItems = list.getElementsByTagName("listitem");
	for ( var i = 0; i < listItems.length; i++) {
		if (listItems[i].getAttribute("label") == removedIndividualName) {
			list.removeChild(listItems[i]);
			break;
		}
	}
	//update the class tree
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for ( var i = 0; i < childList.length; i++) {
		if (parentClassName == childList[i].getAttribute("className")) {
			var treecell = childList[i].getElementsByTagName("treecell")[0];
			var numInst = treecell.getAttribute("numInst") - 1;
			treecell.setAttribute("numInst", numInst);
			var label = treecell.getAttribute("label");
			var show = treecell.getAttribute("show");
			if (numInst == "0") {
				label = show;
			} else {
				label = show + "(" + numInst + ")";
			}
			treecell.setAttribute("label", label);
		}
	}

};
/**
 * @author Noemi invoke rename individual request
 */
art_semanticturkey.renameIndividual = function() {
	var list = document.getElementById("IndividualsList");
	var currentelement = list.selectedItem;
	var parameters = new Object();
	var explicit = currentelement.getAttribute("explicit");
	if (explicit == "true") {
		var name = list.selectedItem.label;
		parameters.resourceName = name;
		parameters.parentWindow = window;
		parameters.resourceType = "individual";
		window.openDialog("chrome://semantic-turkey/content/modifyName.xul",
				"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
				parameters);
	} else {
		alert("You cannot modify this resource, it's a system resource!");
	}
};
/*
 * // NScarpato 22/05/2007 Select a list item whit specified name. function
 * selectItem(list, valName) { // Get the appropriate listitem element var
 * mylist = list; index = 0; while (mylist.getItemAtIndex(index) != null) { if
 * (mylist.getItemAtIndex(index).label == valName) { mylist.selectedIndex =
 * index; mylist.scrollToIndex(index); return; } } }
 */

/**
 * NScarpato 24/02/2007 Aggiunto evento dblClick che apre pannello di
 * Editing(editorPanel)
 */
art_semanticturkey.listdblclick = function(event) {
	var list = document.getElementById('IndividualsList');
	var instanceName = list.selectedItem.label;
	var type = list.selectedItem.getAttribute("type");
	var parameters = new Object();
	parameters.sourceType = type;
	parameters.sourceElement = list.selectedItem;
	parameters.sourceElementName = instanceName;
	parameters.parentWindow = window;
	parameters.list = document.getElementById('IndividualsList');
	parameters.tree = document.getElementById('classesTree');
	parameters.isFirstEditor = true;
	window.openDialog("chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters);
};
// vedere se in enrich crea problemi il fatto che è stata spostata in
// browser-overlay.js
/**
 * @author NScarpato 26/03/2008
 * @description show or hidden contextmenu's items in particular the remove item
 *              that it's shown only if the ontology it's root ontology
 */
art_semanticturkey.showHideItemsList = function() {
	list = document.getElementById('IndividualsList');
	currentelement = list.selectedItem;
	document.getElementById("deleteInst").setAttribute("disabled", false);
	// document.getElementById("deepDeleteInst").setAttribute("disabled",
	// false);
	var explicit = currentelement.getAttribute("explicit");
	if (explicit == "false") {
		document.getElementById("deleteInst").setAttribute("disabled", true);
		document.getElementById("deepDeleteInst")
				.setAttribute("disabled", true);
	}
};
/** *********************************************************************** 
window.addEventListener("load",
		art_semanticturkey.associateEventsOnIndividualGraphicElements, true);*/
