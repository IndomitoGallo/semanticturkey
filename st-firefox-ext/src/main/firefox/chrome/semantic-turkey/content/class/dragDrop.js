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

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};

Components.utils.import("resource://stmodules/ARTResources.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

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

art_semanticturkey.classDragDrop = function(domEvent) {
	
	var selectedRange = domEvent.dataTransfer.mozSourceNode.ownerDocument.getSelection().getRangeAt(0);
			
	var event = {};
	event.name = "selectionOverResource";
	var tree = domEvent.target.parentElement;
	var row = {};
	var col = {};
	var child = {};
	tree.treeBoxObject.getCellAt(domEvent.pageX, domEvent.pageY, row, col,
			child);
	
	if (row.value == -1) {
		return;
	}
	
	var treeItem = tree.view.getItemAtIndex(row.value);
	event.resource = new art_semanticturkey.ARTURIResource(
			treeItem.getAttribute("show"),
			"cls",
			treeItem.getAttribute("className"));
	event.selection = selectedRange;
	event.document = domEvent.dataTransfer.mozSourceNode.ownerDocument;
	event.addons = {};
	event.addons.domEvent = domEvent;
	
	try {
		art_semanticturkey.annotation.AnnotationManager.handleEvent(window, event);
	} catch(e) {
		alert(e.message);
	}
};

art_semanticturkey.classDragDrop_RESPONSE = function(responseArray, tree,selectClass,event) {
	var childList = tree.getElementsByTagName("treeitem");
	var clsName = responseArray['class'].getURI();
	var clsShow = responseArray['class'].getShow();
	var numInst = responseArray['class'].numInst;
	for ( var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndAnnotate(clsName, clsShow, numInst,
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


art_semanticturkey.checkAndAnnotate = function(clsName, clsShow, numInst, node) {
	var className = node.getAttribute("className");
	if (className == clsName) {
		node.getElementsByTagName("treecell")[0]
				.setAttribute("numInst",numInst);
		var newLabel = "";
		newLabel = clsShow + "(" + numInst + ")";
		node.getElementsByTagName("treecell")[0].setAttribute("label", newLabel);
	}
};




/**
 * *************************Instance Events**********************************
 */

art_semanticturkey.instanceDragDrop = function(domEvent) {
	var selectedRange = domEvent.dataTransfer.mozSourceNode.ownerDocument.getSelection().getRangeAt(0);
	
	if (domEvent.target.tagName != "listitem") return;
		
	var event = {};
	event.name = "selectionOverResource";
	event.resource = new art_semanticturkey.ARTURIResource(
			domEvent.target.getAttribute("label"),
			domEvent.target.getAttribute("type"),
			domEvent.target.getElementsByTagName("label")[0].getAttribute("id"));
	event.selection = selectedRange;
	event.document = domEvent.dataTransfer.mozSourceNode.ownerDocument;
	event.addons = {};
	event.addons.domEvent = domEvent;

	try {
		art_semanticturkey.annotation.AnnotationManager.handleEvent(window, event);
	} catch(e) {
		alert(e.message);
	}
};