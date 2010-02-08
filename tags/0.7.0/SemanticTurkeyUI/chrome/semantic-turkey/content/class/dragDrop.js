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
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

art_semanticturkey.associatedragDropEventsOnGraphicElements = function() {
	document.getElementById("classesTree").addEventListener("drop",
			art_semanticturkey.classDragDrop, true);
	/*
	 * Other events seems not to be useful
	 * ondraggesture="treeDragGesture(event)" ondragenter="treeDragEnter(event)"
	 * ondragover="return DragOverContentArea(event);"
	 * ondragexit="treeDragExit(event)"
	 */

	document.getElementById("IndividualsList").addEventListener("drop",
			art_semanticturkey.instanceDragDrop, true);
	/*
	 * Other events seems not to be useful ondragenter="listDragEnter(event)"
	 * ondragover="return listDragOverContentArea(event);"
	 * ondragexit="listDragExit(event)" ondrop="listDragDrop(event,server);"
	 */
};
art_semanticturkey.getOutlineItem = function(tree, index) {
	// Get the appropriate treeitem element
	// There's a dumb thing with trees in that mytree.currentIndex
	// Shows the index of the treeitem that's selected, but if there is a
	// collapsed branch above that treeitem, all the items in that branch are
	// not included in the currentIndex value, so
	// "var treeitem =
	// mytree.getElementsByTagName('treeitem')[mytree.currentIndex]"
	// doesn't work.
	var mytree = tree;
	if (!mytree) {
		mytree = document.getElementById("classesTree");
	}
	var items = mytree.getElementsByTagName('treeitem');
	for ( var i = 0; i < items.length; i++) {
		if (mytree.contentView.getIndexOfItem(items[i]) == index) {
			return items[i];
		}
	}
	return null; // Should never get here
};

art_semanticturkey.classDragDrop = function(event) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
			.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	if (AnnotFunctionList[defaultAnnotFun] != null) {
		var responseXML = AnnotFunctionList[defaultAnnotFun]["classDragDrop"](event, window);
		if(responseXML != null){
			var tree = document.getElementById("classesTree");
			art_semanticturkey.classDragDrop_RESPONSE(responseXML,tree,true,event);
		}
			
	} else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
};

art_semanticturkey.classDragDrop_RESPONSE = function(responseElement, tree,selectClass,event) {
	var childList = tree.getElementsByTagName("treeitem");
	var resourceElement = responseElement
			.getElementsByTagName('Class')[0];
	var clsName = resourceElement.getAttribute("clsName");
	var numTotInst = resourceElement.getAttribute("numTotInst");
	for ( var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndAnnotate(clsName, numTotInst,
				childList[i]);
	}
	if(typeof event != 'undefined' && selectClass){
		tree.view.selection.clearSelection();
		var row = {};
		var col = {};
		var child = {};
		tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col,
				child);
		tree.view.selection.toggleSelect(row.value);
		art_semanticturkey.classesTreeClick("");
	}	
};


art_semanticturkey.checkAndAnnotate = function(clsName, numTotInst, node) {
	var className = node.getAttribute("className");
	if (className == clsName) {
		node.getElementsByTagName("treecell")[0]
				.setAttribute("numInst",numTotInst);
		var newLabel = "";
		newLabel = clsName + "(" + numTotInst + ")";
		node.getElementsByTagName("treecell")[0].setAttribute("label", newLabel);
	}
};




/**
 * *************************Instance Events**********************************
 */

art_semanticturkey.instanceDragDrop = function(event) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
			.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	if (AnnotFunctionList[defaultAnnotFun] != null) {
		AnnotFunctionList[defaultAnnotFun]["listDragDrop"](event, window);
		
	} else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
};