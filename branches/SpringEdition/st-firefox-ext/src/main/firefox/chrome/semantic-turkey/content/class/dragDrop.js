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
		//get the function of the selected family for the event drag'n'drop over class
		var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("dragDropOverClass");
		var count=0;
		var index;
		
		//check how many functions are present and enabled
		for(var j=0; j<FunctionOI.length;j++)
			if(FunctionOI[j].isEnabled()){
				count++;
				index=j;
			}
		
		//if no function is present/enabled alert the user
		if(count == 0)
			alert("No registered or enabled functions for this event");
		//if 1 function is present and enabled execute it 
		else if (count == 1) {
			var fun = FunctionOI[index].getfunct();
			fun(event, window);
		}
		//open the choice menu
		else {
			var parameters = new Object();
			parameters.event = event;
			parameters.parentWindow = window;
			window.openDialog(
					"chrome://semantic-turkey/content/DragDrop/dragDropOverClass.xul",
					"_blank", "modal=yes,resizable,centerscreen",
					parameters);
		}
			
	} 
	else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
};

art_semanticturkey.classDragDrop_RESPONSE = function(responseArray, tree,selectClass,event) {
	var childList = tree.getElementsByTagName("treeitem");
	var clsName = responseArray['class'].getURI();
	var numInst = responseArray['class'].numInst;
	for ( var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndAnnotate(clsName, numInst,
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


art_semanticturkey.checkAndAnnotate = function(clsName, numInst, node) {
	var className = node.getAttribute("className");
	if (className == clsName) {
		node.getElementsByTagName("treecell")[0]
				.setAttribute("numInst",numInst);
		var newLabel = "";
		newLabel = clsName + "(" + numInst + ")";
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
		//get the function of the selected family for the event drag'n'drop over instance
		var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("dragDropOverInstance");
		var count=0;
		var index;
		
		//check how much function are present and enabled
		for(var j=0; j<FunctionOI.length;j++)
			if(FunctionOI[j].isEnabled()){
				count++;
				index=j;
			}
		
		//if no functions alert the user
		if(count == 0)
			alert("No registered or enabled functions for this event");
		//if 1 function is present and enabled execute
		else if (count == 1) {
			var fun = FunctionOI[index].getfunct();
			fun(event, window);
		}
		//open the choice menu
		else {
			var parameters = new Object();
			parameters.event = event;
			parameters.parentWindow = window;
			window.openDialog(
					"chrome://semantic-turkey/content/DragDrop/dragDropOverInstance.xul",
					"_blank", "modal=yes,resizable,centerscreen",
					parameters);
		}
	} 
	else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}

};