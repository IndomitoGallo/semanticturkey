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

// Returns the currently selected tree item.
art_semanticturkey.currentOutlineItem = function(tree) {
	// Get the appropriate treeitem element
	var mytree = tree;
	if (!mytree) {
		mytree = document.getElementById('outlineTree');
	}
	if (!mytree) {
		mytree = document.getElementById('myAddPropertyTree');
	}
	if (!mytree) {
		mytree = document.getElementById("propertiesTree");
	}
	return getOutlineItem(tree, mytree.currentIndex);
};

// Returns the _exe_nodeid attribute of the currently selected row item
art_semanticturkey.currentOutlineId = function(index) {
	var treeitem = currentOutlineItem();
	return treeitem.getElementsByTagName('treerow')[0]
			.getAttribute('_exe_nodeid');
};

art_semanticturkey.classDragGesture = function(event) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var mytree = document.getElementById("classesTree");
	if (!mytree) {
		mytree = document.getElementById('myAddPropertyTree');
	}
	if (!mytree) {
		mytree = document.getElementById("propertiesTree");
	}

	var treeitem = currentOutlineItem(mytree);

	var treerow = treeitem.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];

	if (treecell.getAttribute('properties') != "instance") {
		return;
	} else
		return; // TODO : manage instance migration

	// Only allow dragging of treeitems below main
	// if (tree.view.getIndexOfItem(treeitem) <= 1) { alert("nodrag"); return }
	// Don't start drag because they are moving the scroll bar!
	var row = {};
	var col = {};
	var child = {};
	tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child);
	if (!col.value) {
		return;
	}
	// CRAPINESS ALERT!
	// If they're moving, (without ctrl down) the target node becomes our
	// sibling
	// above us. If copying, the source node becomes the first child of the
	// target node
	var targetNode = getOutlineItem(tree, row.value);
	// Start packaging the drag data (Which we don't use but have to do anyway)
	var data = new Array(treeitem);
	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var trans = Components.classes["@mozilla.org/widget/transferable;1"]
			.createInstance(Components.interfaces.nsITransferable);
	trans.addDataFlavor("text/plain");
	var textWrapper = Components.classes["@mozilla.org/supports-string;1"]
			.createInstance(Components.interfaces.nsISupportsString);
	textWrapper.data = currentOutlineId(); // Get the id of the node bieng
	// dragged
	trans.setTransferData("text/plain", textWrapper, textWrapper.data.length); // double
	// byte
	// data
	// create an array for our drag items, though we only have one this time
	var transArray = Components.classes["@mozilla.org/supports-array;1"]
			.createInstance(Components.interfaces.nsISupportsArray);
	// Put it into the list as an |nsISupports|
	// var data = trans.QueryInterface(Components.interfaces.nsISupports);
	transArray.AppendElement(trans);
	// Actually start dragging
	ds.invokeDragSession(treeitem, transArray, null, ds.DRAGDROP_ACTION_COPY
			+ ds.DRAGDROP_ACTION_MOVE);

	event.stopPropagation(); // This line was in an example, will test if we
	// need it later...
};

art_semanticturkey.classDragEnter = function(event) {
	window.status = "treeDragEnter";
	event.stopPropagation(); // This line was in an example, will test if we
	// need it later...
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var ses = ds.getCurrentSession();
	var tree = document.getElementById('outlineTree');
	// tree.treeBoxObject.onDragEnter(event)
	if (ses) {
		ses.canDrop = 'true';
	}
};

art_semanticturkey.classDragOverContentArea = function(event) {
	var validFlavor = false;
	var dragSession = null;
	var tree = document.getElementById('outlineTree');
	var row = {};
	var col = {};
	var child = {};
	tree.treeBoxObject.getCellAt(event.pageX, event.pageY, row, col, child);
	var targetNode = getOutlineItem(tree, row.value);
	// document.getElementById("myout").value = targetNode.id; //ATTENTION!
	targetNode.style.backgroundColor = "red";
	targetNode.style.color = "red";
	try {
		netscape.security.PrivilegeManager
				.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	/*
	 * var file = Components.classes["@mozilla.org/file/local;1"]
	 * .createInstance(Components.interfaces.nsILocalFile); var outputStream =
	 * Components.classes["@mozilla.org/network/file-output-stream;1"]
	 * .createInstance( Components.interfaces.nsIFileOutputStream );
	 */

	// var dragService =
	// Components.classes["component://netscape/widget/dragservice"].getService(Components.interfaces.nsIDragService);
	// Components.classes["@mozilla.org/netscape/widget/dragservice"].getService(Components.interfaces.nsIDragService);
	var dragService = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService().QueryInterface(Components.interfaces.nsIDragService);

	if (dragService) {
		dragSession = dragService.getCurrentSession();
		if (dragSession) {
			if (dragSession.isDataFlavorSupported("moz/toolbaritem"))
				validFlavor = true;
			else if (dragSession.isDataFlavorSupported("text/plain"))
				validFlavor = true;
			// XXX other flavors here...such as files from the desktop?

			if (validFlavor) {
				// XXX do some drag feedback here, set a style maybe???
				dragSession.canDrop = true;
				event.stopPropagation();
			}
		}
	}
}; // DragOverContentArea

art_semanticturkey.classDragExit = function(event) {
	event.stopPropagation(); // This line was in an example, will test if we
	// need it later...
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var ses = ds.getCurrentSession();
	var tree = document.getElementById('outlineTree');
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
		AnnotFunctionList[defaultAnnotFun][3](event, document);
	} else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
};
/**
 * *************************Instance Events**********************************
 */
art_semanticturkey.instanceDragGesture = function(event) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var mylist = document.getElementById('IndividualsList');

	/*
	 * if (treecell.getAttribute('properties') != "instance") { return; } else
	 * return; // TODO : manage instance migration // Only allow dragging of
	 * treeitems below main // if (tree.view.getIndexOfItem(treeitem) <= 1) {
	 * alert("nodrag"); return } // Don't start drag because they are moving the
	 * scroll bar!
	 */
	var row = {};
	var col = {};
	var child = {};
	mylist.listBoxObject.getCellAt(event.pageX, event.pageY, row, col, child);
	if (!col.value) {
		return

		

				

		

						

		

				

		

								

		

				

		

						

		

				

		

										

		

				

		

						

		

				

		

								

		

				

		

						

		

				

		

												

		

				

		

						

		

				

		

								

		

				

		

						

		

				

		

										

		

				

		

						

		

				

		

								

		

				

		

						

		

				

		

	} else {
	}
	// CRAPINESS ALERT!
	// If they're moving, (without ctrl down) the target node becomes our
	// sibling
	// above us. If copying, the source node becomes the first child of the
	// target node
	/*
	 * var targetNode = getOutlineItem(mylist, row.value) // Start packaging the
	 * drag data (Which we don't use but have to do anyway) var data = new
	 * Array(treeitem) var ds =
	 * Components.classes["@mozilla.org/widget/dragservice;1"].getService(Components.interfaces.nsIDragService);
	 * var trans =
	 * Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
	 * trans.addDataFlavor("text/plain"); var textWrapper =
	 * Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
	 * textWrapper.data = currentOutlineId(); // Get the id of the node bieng
	 * dragged trans.setTransferData("text/plain", textWrapper,
	 * textWrapper.data.length); // double byte data // create an array for our
	 * drag items, though we only have one this time var transArray =
	 * Components.classes["@mozilla.org/supports-array;1"].createInstance(Components.interfaces.nsISupportsArray); //
	 * Put it into the list as an |nsISupports| //var data =
	 * trans.QueryInterface(Components.interfaces.nsISupports);
	 * transArray.AppendElement(trans); // Actually start dragging
	 * ds.invokeDragSession(treeitem, transArray, null, ds.DRAGDROP_ACTION_COPY +
	 * ds.DRAGDROP_ACTION_MOVE); event.stopPropagation(); // This line was in an
	 * example, will test if we need it later...
	 */
};

art_semanticturkey.instanceDragEnter = function(event) {
	window.status = "treeDragEnter";
	event.stopPropagation();
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var ds = Components.classes["@mozilla.org/widget/dragservice;1"]
			.getService(Components.interfaces.nsIDragService);
	var ses = ds.getCurrentSession();
	var list = document.getElementById('InstancesList');
	// tree.treeBoxObject.onDragEnter(event)
	if (ses) {
		ses.canDrop = 'true';
	}
};

art_semanticturkey.instanceDragOverContentArea = function(event) {
	var validFlavor = false;
	var dragSession = null;
	var list = document.getElementById('InstancesList');
}; // DragOverContentArea

art_semanticturkey.instanceDragExit = function(event) {
	// art_semanticturkey.Logger.debug("instanceDragExit(event)");

};

art_semanticturkey.instanceDragDrop = function(event) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
			.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	if (AnnotFunctionList[defaultAnnotFun] != null) {
		AnnotFunctionList[defaultAnnotFun][2](event, document);
	} else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
};

/** ************************************************************************ */
window.addEventListener("load",
		art_semanticturkey.associatedragDropEventsOnGraphicElements, true);
