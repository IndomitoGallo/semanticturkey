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
/**
 * @author Noemi Andrea provide add listener for events related to graphic
 *         elements it is invokes by window.onload in main script class.js
 */

art_semanticturkey.associateEventsOnGraphicElementsClasses = function() {
	document.getElementById("classesTree").addEventListener("dblclick",
			art_semanticturkey.classesTreedoubleClick, true);
	document.getElementById("classesTree").addEventListener("click",
			art_semanticturkey.classesTreeClick, true);
	document.getElementById("classesTree").addEventListener("keypress",
			art_semanticturkey.onKeyPressed, true);

	document.getElementById("createRootClass").addEventListener("command",
			art_semanticturkey.createRootClass, true);
	document.getElementById("createSubClass").addEventListener("command",
			art_semanticturkey.createSubClass, true);
	document.getElementById("createSiblingClass").addEventListener("command",
			art_semanticturkey.createSiblingClass, true);
	document.getElementById("removeClass").addEventListener("command",
			art_semanticturkey.removeClass, true);
	/*
	 * document.getElementById("graph").addEventListener("command",
	 * art_semanticturkey.graph, true);
	 */
	// var stIsStarted = art_semanticturkey.ST_started.getStatus();
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if (projectIsNull == true) {
		document.getElementById("createRootClass").disabled = true;
		document.getElementById("createSubClass").disabled = true;
		document.getElementById("createSiblingClass").disabled = true;
		document.getElementById("removeClass").disabled = true;
		// document.getElementById("graph").disabled = true;
	}

	document.getElementById("clipmenu").addEventListener("popuping",
			art_semanticturkey.showHideItems, true);

	document.getElementById("menuItemCreateIndividual").addEventListener(
			"command", art_semanticturkey.createIndividual, true);
	document.getElementById("menuItemCreateSiblingClass").addEventListener(
			"command", art_semanticturkey.createSiblingClass, true);
	document.getElementById("menuItemSubClass").addEventListener("command",
			art_semanticturkey.createSubClass, true);
	document.getElementById("menuItemRemoveClass").addEventListener("command",
			art_semanticturkey.removeClass, true);
	document.getElementById("menuItemRenameClass").addEventListener("command",
			art_semanticturkey.renameClass, true);
	document.getElementById("menuItemAddSynonym").addEventListener("command",
			art_semanticturkey.addSynonym, true);
	// document.getElementById("menuItemGraph").addEventListener("command",
	// art_semanticturkey.partialGraph, true);

};



art_semanticturkey.getClassesInfoAsRootsForTree_RESPONSE = function(
		responseCollection) {
	var rootTreechildren = document.getElementById('rootClassTreeChildren');
	//var dataElement = responseElement.getElementsByTagName('data')[0];
	//var classList = dataElement.getElementsByTagName("class");
	for (var i = 0; i < responseCollection.length; ++i) {
		//art_semanticturkey.parsingSubClass(classList[i], rootTreechildren,
		//		isRootNode);
		art_semanticturkey
				.parsingSubClass(responseCollection[i], rootTreechildren, true);
	}

	// open the owl:Thing node if it is the only node
	if (responseCollection.length == 1) {
		var treeItemThing = rootTreechildren.getElementsByTagName("treeitem")[0];
		var tree = document.getElementById("classesTree");
		tree.view.selection.clearSelection();
		tree.view.selection.toggleSelect(0);

		try {
			var treeChildren = treeItemThing
					.getElementsByTagName("treechildren")[0];
			//var responseXML = art_semanticturkey.STRequests.Cls.getSubClasses(
			//		"http://www.w3.org/2002/07/owl#Thing", true, true);
			//art_semanticturkey.getSubClassesTree_RESPONSE(responseXML,
			//		treeChildren);
			var collectionSubClass = art_semanticturkey.STRequests.Cls.getSubClasses(
					"http://www.w3.org/2002/07/owl#Thing", true, true);
			art_semanticturkey.getSubClassesTree_RESPONSE(collectionSubClass,
					treeChildren);
			tree.treeBoxObject.view.toggleOpenState(tree.currentIndex);
			
			var list = document.getElementById("IndividualsList");
			responseArray = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo(
							"http://www.w3.org/2002/07/owl#Thing", true);
			art_semanticturkey.getClassAndInstancesInfo_RESPONSE(responseArray,
					list);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
}

/**
 * @author Noemi Andrea Build classes tree using response returned by
 *         art_semanticturkey.STRequests.Cls.getClassTree request
 */
art_semanticturkey.getClassTree_RESPONSE = function(responseElement,
		rootTreechildren) {
	var rootTreechildren = rootTreechildren;
	if (typeof rootTreechildren == 'undefined')
		rootTreechildren = document.getElementById('rootClassTreeChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var classList = dataElement.childNodes;
	for (var i = 0; i < classList.length; i++) {
		if (classList[i].nodeType == 1) {
			art_semanticturkey.parsingClass(classList[i], rootTreechildren,
					true);
		}
	}
};

art_semanticturkey.getSubClassesTree_RESPONSE = function(collectionSubClass,
		rootTreechildren) {
	var rootTreechildren = rootTreechildren;
	var isRootNode = false;
	if (typeof rootTreechildren == 'undefined') {
		rootTreechildren = document.getElementById('rootClassTreeChildren');
		isRootNode = true;
	}
	//var dataElement = responseElement.getElementsByTagName('data')[0];
	//var classList = dataElement.childNodes;
	for (var i = 0; i < collectionSubClass.length; i++) {
		//if (classList[i].nodeType == 1) {
		art_semanticturkey.parsingSubClass(collectionSubClass[i], rootTreechildren,
				isRootNode);
		//}
	}
};

art_semanticturkey.parsingSubClass = function(classNode, node, isRootNode) {
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	var numInst = classNode.numInst;
	
	var showValue;
	showValue = classNode.getShow();
	
	if (numInst != 0) {
		tc.setAttribute("label", showValue +"("+ numInst+")");
	} else {
		tc.setAttribute("label", showValue);
	}
	
	tc.setAttribute("show", showValue);
	tc.setAttribute("numInst", numInst);
	
	var deleteForbidden;
	deleteForbidden = classNode.deleteForbidden;
	if(deleteForbidden == null)
		deleteForbidden = false;
	tc.setAttribute("deleteForbidden", deleteForbidden);
	if (deleteForbidden == "true")
		tc.setAttribute("properties", "basetrue");
	
	tc.setAttribute("isRootNode", isRootNode);
	tr.appendChild(tc);
	
	var ti = document.createElement("treeitem");
	ti.setAttribute("className", classNode.getURI());
	ti.setAttribute("show", showValue);
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	node.appendChild(ti);
	var more = classNode.more;
	
	if (more == "1") {
		ti.appendChild(tch);
		ti.setAttribute("container", true);
		ti.setAttribute("open", false);
	} else {
		ti.setAttribute("container", false);
	}
}
/**
 * @author Noemi Andrea Create recursively the elements of the classes trees
 */
art_semanticturkey.parsingClass = function(classNode, node, isRootNode) {
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	var numInst = classNode.getAttribute("numInst");
	if (numInst != 0) {
		tc.setAttribute("label", classNode.getAttribute("name") + numInst);
		numInst = numInst.substring(1, numInst.length - 1);

	} else {
		tc.setAttribute("label", classNode.getAttribute("name"));
	}
	tc.setAttribute("numInst", numInst);
	tc.setAttribute("deleteForbidden", classNode
					.getAttribute("deleteForbidden"));
	var df = classNode.getAttribute("deleteForbidden");
	if (df == "true")
		tc.setAttribute("properties", "basetrue");
	tc.setAttribute("isRootNode", isRootNode);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.setAttribute("className", classNode.getAttribute("name"));
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	node.appendChild(ti);
	// var more = classNode.getAttribute("more");
	var subClassList = classNode.getElementsByTagName("SubClasses")[0].childNodes;
	if (subClassList.length > 0) {
		// if (more == "1") {
		ti.appendChild(tch);
		ti.setAttribute("container", true);
		ti.setAttribute("open", false);

		for (var i = 0; i < subClassList.length; i++) {
			if (subClassList[i].nodeName == "Class")
				art_semanticturkey.parsingClass(subClassList[i], tch, false);
		}

	} else {
		ti.setAttribute("container", false);
	}
};

art_semanticturkey.onKeyPressed = function(event) {
	var keyCode = event.keyCode;
	var tree = document.getElementById("classesTree");

	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		return;
	}
	art_semanticturkey.openSubClassesList(event);
	art_semanticturkey.loadInstanceList(event);
}

art_semanticturkey.openSubClassesList = function(event, tree) {
	var action = "null";
	var tree = tree;
	if (typeof tree == 'undefined')
		tree = document.getElementById("classesTree");
	var treeitem;
	if (event.type == "keypress") {
		var keyCode = event.keyCode;
		treeitem = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
		var isContainer = treeitem.getAttribute("container");
		if (isContainer == "false") {
			return;
		}
		var isOpen = treeitem.getAttribute("open");	
		if (keyCode == KeyEvent.DOM_VK_RETURN) {
			if (isOpen == "true") {
				action = "loadSubTree";
			} else if (isOpen == "false") {
				action = "emptySubTree";
			}
		} else if ((keyCode == KeyEvent.DOM_VK_RIGHT) && (isOpen == "true")) {
			action = "loadSubTree";
		} else if ((keyCode == KeyEvent.DOM_VK_LEFT) && (isOpen == "false")) {
			action = "emptySubTree";
		} else {
			return;
		}
	} else if (event.type == "click") {
		var row = {};
		var col = {};
		var part = {};
		tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col,
				part);
		treeitem = tree.contentView.getItemAtIndex(row.value);
		var isContainer = treeitem.getAttribute("container");
		if (isContainer == "false") {
			return;
		}
		var isTwisty = (part.value == "twisty");
		if (isTwisty == false) {
			// the user did not click on the twisty, so he does not want the sub
			// classes
			return;
		}
		var isOpen = treeitem.getAttribute("open");
		if (isOpen == "true") {
			action = "emptySubTree";
		} else if (isOpen == "false") {
			action = "loadSubTree";
		}
	} else {
		return
	}

	// do the requested action
	var treeChildren = treeitem.getElementsByTagName("treechildren")[0];
	if (action == "loadSubTree") {
		// EMPTY TREE, just to be extra sure
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		var className = treeitem.getAttribute("className");
		var collectionSubClass = art_semanticturkey.STRequests.Cls.getSubClasses(
				className, true, true);
		art_semanticturkey
				.getSubClassesTree_RESPONSE(collectionSubClass, treeChildren);
	} else if (action == "emptySubTree") {
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
	}

}

art_semanticturkey.loadInstanceList = function(event, tree, list) {
	if (event.type == "keypress") {
		var keyCode = event.keyCode;
		if ((keyCode != KeyEvent.DOM_VK_UP)
				&& (keyCode == KeyEvent.DOM_VK_DOWN)
				&& (keyCode != KeyEvent.DOM_VK_LEFT)
				&& (keyCode == KeyEvent.DOM_VK_RIGHT)) {
			return;
		}
	}
	var tree = tree;
	if (typeof tree == 'undefined')
		tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var numInst = treecell.getAttribute("numInst");
	var className = currentelement.getAttribute("className");
	var list = list;
	if (typeof list == 'undefined')
		var list = document.getElementById("IndividualsList");
	// if (numInst > 0) {
	try {
		var start = new Date().getTime();

		var responseArray = art_semanticturkey.STRequests.Cls
				.getClassAndInstancesInfo(className, true);
		art_semanticturkey.getClassAndInstancesInfo_RESPONSE(responseArray, list,
				start);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
	/*
	 * } else { var rows = list.getRowCount(); while (rows--) {
	 * list.removeItemAt(rows); } list.getElementsByTagName('listheader')[0]
	 * .getElementsByTagName('listitem-iconic')[0]
	 * .getElementsByTagName('label')[0].setAttribute("value", "Instances of " +
	 * className); }
	 */

}

/**
 * @author Noemi Andrea invoke remove class request
 */
art_semanticturkey.removeClass = function() {

	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var treechildren = currentelement.getElementsByTagName('treechildren')[0];
	var parameters = new Object();
	parameters.tree = document.getElementById('outlineTree');
	var name = treecell.getAttribute("label");
	var numInst = treecell.getAttribute("numInst");
	parameters.currentelement = currentelement;
	parameters.name = name;
	var parent = currentelement.parentNode.parentNode.parentNode.parentNode;
	parameters.parent = parent;
	parentcell = parent.getElementsByTagName('treecell')[0];
	var parentLabel = parentcell.getAttribute("label");
	var parentNumInst = parentcell.getAttribute("numInst");
	if (parentNumInst > 0) {
		parentLabel = parentLabel.substring(0, parentLabel.lastIndexOf('('));
	}
	parameters.parentIconicName = parentLabel;
	var deleteForbidden = treecell.getAttribute("deleteForbidden");
	if (deleteForbidden == "true") {
		alert("You cannot delete this class, it's a system resource!");
	} else if (numInst != 0) {
		alert("You cannot delete this class because it has instances!");
	} else if (treechildren != null) {
		alert("You cannot delete this class because it has subClasses!");
	} else {
		try {
			var responseURI = art_semanticturkey.STRequests.Delete
					.removeClass(name);
			art_semanticturkey.removeClass_RESPONSE(responseURI);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
	return;
};

/**
 * @author Noemi Andrea remove class from classes tree using the response of
 *         remove Class request
 */

art_semanticturkey.removeClass_RESPONSE = function(responseURI) {
	art_semanticturkey.evtMgr.fireEvent("removedClass",
			(new art_semanticturkey.classRemovedClass(responseURI)));

};

/**
 * @author Noemi Andrea invoke rename class request
 */
art_semanticturkey.renameClass = function() {
	var tree = document.getElementById("classesTree");
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var parameters = new Object();

	var modify = treecell.getAttribute("deleteForbidden");
	if (modify == "false") {
		var name = treecell.getAttribute("label");
		var numInst = treecell.getAttribute("numInst");
		if (numInst > 0) {
			name = name.substring(0, name.lastIndexOf('('));
		}
		parameters.resourceName = name;
		parameters.parentWindow = window;
		parameters.resourceType = "class";
		window.openDialog("chrome://semantic-turkey/content/modifyName.xul",
				"_blank",
				"chrome,dependent,dialog,modal=yes,resizable,centerscreen",
				parameters);
	} else {
		alert("You cannot modify this class, it's a system resource!");
	}
};

art_semanticturkey.renameResource_RESPONSE = function(responseElement,
		resourceType) {
	var resourceElement = responseElement
			.getElementsByTagName('UpdateResource')[0];
	var newResourceName = resourceElement.getAttribute("newname");
	var oldResourceName = resourceElement.getAttribute("name");
	if (resourceType == "class") {
		art_semanticturkey.evtMgr.fireEvent("renamedClass",
				(new art_semanticturkey.classRenamedClass(newResourceName,
						oldResourceName)));
	} else if (resourceType == "individual") {
		art_semanticturkey.evtMgr.fireEvent("renamedIndividual",
				(new art_semanticturkey.individualRenamedIndividual(
						newResourceName, oldResourceName)));
	}
};

/**
 * @author Noemi Andrea invoke create root class request
 */
art_semanticturkey.createRootClass = function(event) {
	var tree = document.getElementById("classesTree");
	var parameters = new Object();
	parameters.type = "rootClass";
	parameters.parentWindow = window;
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/createClass/createClass.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
};

/**
 * @author Noemi Andrea invoke create sub class request
 */
art_semanticturkey.createSubClass = function() {
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var parameters = new Object();
	parameters.type = "subClass";
	parameters.parentTreecell = treecell;
	parameters.parentWindow = window;
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/createClass/createClass.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
};

/**
 * @author Noemi Andrea invoke create sibling class request
 */

art_semanticturkey.createSiblingClass = function() {
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var isRootNode = treecell.getAttribute('isRootNode');
	var parameters = new Object();
	if (isRootNode == "true") {
		parameters.type = "rootClass";
	} else {
		parameters.type = "subClass";
		var parent = currentelement.parentNode.parentNode;
		var parentTreecell = parent.getElementsByTagName('treecell')[0];
		parameters.parentTreecell = parentTreecell;
	}
	parameters.parentWindow = window;
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/createClass/createClass.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.addClass_RESPONSE = function(responseArray) {

	//var superClassElement = responseArray.getElementsByTagName('superclass')[0];
	//var superClassName = superClassElement.getAttribute("name");
	//var classElement = responseArray.getElementsByTagName('class')[0];
	//var className = classElement.getAttribute("name");

	art_semanticturkey.evtMgr
			.fireEvent("createdSubClass",
					(new art_semanticturkey.classAddedClass(responseArray["class"],
							responseArray["superClass"])));
	
};


/**
 * @author Noemi Andrea invoke add Synonym request
 */
art_semanticturkey.addSynonym = function() {
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var cllabel = treecell.getAttribute("label");
	var numInst = treecell.getAttribute("numInst");
	if (numInst > 0) {
		cllabel = cllabel.substring(0, cllabel.lastIndexOf('('));
	}
	var parameters = new Object();
	parameters.name = cllabel;
	parameters.parentWindow = window;
	window.openDialog("chrome://semantic-turkey/content/synonym/synonym.xul",
			"_blank",
			"chrome,dependent,dialog,modal=yes,resizable,centerscreen",
			parameters);
};

/**
 * @author Noemi Andrea invoke partial graph request that load the applet of
 *         graph and show a partial graph focus on the selected class
 */

art_semanticturkey.partialGraph = function() {
	art_semanticturkey.Logger.debug("dentro Partial Graph");
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var className = treecell.getAttribute("label");
	try {
		art_semanticturkey.STRequests.Graph.partialGraph(className);
		window.content.document.location.href = "http://127.0.0.1:1979/semantic_turkey/resources/graph/Proxy?URL=http://"
				+ "127.0.0.1:1979/semantic_turkey/resources/applet/TGLinkBrowser.html";
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};
/**
 * @author Noemi Andrea invoke partial graph request that load the applet of
 *         graph
 */
art_semanticturkey.graph = function() {
	try {
		art_semanticturkey.STRequests.Graph.graph();
		window.content.document.location.href = "http://127.0.0.1:1979/semantic_turkey/resources/graph/Proxy?URL=http://"
				+ "127.0.0.1:1979/semantic_turkey/resources/applet/TGLinkBrowser.html";
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

/**
 * NScarpato 26/03/2008 show or hidden contextmenu's items in particular the
 * remove item that it's shown only if the ontology it's root ontology
 */
art_semanticturkey.showHideItems = function() {
	tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		// document.getElementById("menuItemGraph").disabled = true;
		document.getElementById("menuItemCreateIndividual").disabled = true;
		document.getElementById("menuItemSubClass").disabled = true;
		document.getElementById("menuItemRemoveClass").disabled = true;
		document.getElementById("menuItemRenameClass").disabled = true;
		document.getElementById("menuItemAddSynonym").disabled = true;
		document.getElementById("menuItemCreateSiblingClass").disabled = true;
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	// document.getElementById("menuItemGraph").disabled = false;
	document.getElementById("menuItemCreateIndividual").disabled = false;
	document.getElementById("menuItemSubClass").disabled = false;
	document.getElementById("menuItemRemoveClass").disabled = false;
	document.getElementById("menuItemRenameClass").disabled = false;
	document.getElementById("menuItemAddSynonym").disabled = false;
	document.getElementById("menuItemCreateSiblingClass").disabled = false;
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var deleteForbidden = treecell.getAttribute("deleteForbidden");
	if (deleteForbidden == "true") {
		document.getElementById("menuItemRemoveClass").disabled = true;
		document.getElementById("menuItemRenameClass").disabled = true;
	}
};
/**
 * @author Noemi Andrea invoke get Instance list request that return a list that
 *         contains instances of selected class
 */
art_semanticturkey.classesTreeClick = function(event, tree, list) {
	if (typeof event != 'undefined') {
		art_semanticturkey.openSubClassesList(event, tree);
		art_semanticturkey.loadInstanceList(event, tree, list);
	}
};

art_semanticturkey.getClassAndInstancesInfo_RESPONSE = function(
		responseArray, list, startAll) {
	//var startJustUIComplete = new Date().getTime();
	var list = list;
	if (typeof list == 'undefined')
		list = document.getElementById("IndividualsList");
	var rows = list.getRowCount();
	while (rows--) {
		list.removeItemAt(rows);
	}
	var parentClassNameURI = responseArray['class'].getURI()
	var parentClassNameShow = "";
	
	var numTotInst = responseArray['class'].numInst;
	var hasSubClasses = responseArray['class'].more; // this can be "1" or "0" or null

	var classTree = document.getElementById("classesTree");

	if (classTree != null) {
		var childList = classTree.getElementsByTagName("treeitem");
		for (var i = 0; i < childList.length; i++) {
			if (childList[i].getAttribute("className") == parentClassNameURI) {
				if (hasSubClasses != null) {
					var isAlreadyContainer = childList[i].getAttribute("container");
					var isOpen = childList[i].getAttribute("open");
					if (hasSubClasses == "1") {
						childList[i].setAttribute("container", true);
						if (isAlreadyContainer == false)
							childList[i].setAttribute("open", false);
					} else { // == 0
						childList[i].setAttribute("container", false);
					}
				}
				var treecell = childList[i].getElementsByTagName("treecell")[0];
				treecell.setAttribute("numInst", numTotInst);
				parentClassNameShow = treecell.getAttribute("show");
				if (numTotInst > 0)
					treecell.setAttribute("label", treecell.getAttribute("show") + "("
									+ numTotInst + ")");
				else
					treecell.setAttribute("label", treecell.getAttribute("show"));
			}
		}
	}

	list.getElementsByTagName('listheader')[0]
			.getElementsByTagName('listitem-iconic')[0]
			.getElementsByTagName('label')[0].setAttribute("value",
			"Instances of " + parentClassNameShow);
	list.getElementsByTagName('listheader')[0].setAttribute("parentCls",
			parentClassNameURI);
	list.getElementsByTagName('listheader')[0].setAttribute("numTotInst",
			numTotInst);
	
	var instancesResList = responseArray['instances'];
	//var startJustUI = new Date().getTime();
	for (var i = 0; i < instancesResList.length; i++) {
		var instName = instancesResList[i].getShow();
		var lsti = document.createElement("listitem");
		lsti.setAttribute("label", instName);
		var explicit = instancesResList[i].explicit;
		lsti.setAttribute("explicit", explicit);
		lsti.setAttribute("parentCls", parentClassNameURI);
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		var type = instancesResList[i].getRole();
		lsti.setAttribute("type", type);
		img.setAttribute("src", art_semanticturkey.getImgFromType(type,
						explicit));

		lci.appendChild(img);
		var lbl = document.createElement("label");
		lbl.setAttribute("value", instName);
		lbl.setAttribute("id", instName);
		lbl.setAttribute("class", "base");
		lci.appendChild(lbl);
		lsti.appendChild(lci);
		list.appendChild(lsti);
	}

	/*
	var end = new Date().getTime();
	var time = end - startAll;
	art_semanticturkey.Logger
			.debug('Execution time loading istanceList (plus Server): ' + time
					+ " ms");
	time = end - startJustUIComplete;
	art_semanticturkey.Logger
			.debug('Execution time removing/adding istanceList (not the Server): '
					+ time + " ms");
	time = end - startJustUI;
	art_semanticturkey.Logger
			.debug('Execution time adding istanceList (not the Server): '
					+ time + " ms");
	*/
};

art_semanticturkey.getImgFromType = function(type, explicit) {
	var imgType;
	if (type == "individual") {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/individual_noexpl.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/individual.png";
	} else if (type == "cls") {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/class_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/class.png";
	} else if (type.indexOf("ObjectProperty") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/propObject_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/propObject20x20.png";
	} else if (type.indexOf("DatatypeProperty") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/propDatatype_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/propDatatype20x20.png";
	} else if (type.indexOf("AnnotationProperty") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/propAnnotation_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/propAnnotation20x20.png";
	} else if (type.indexOf("Property") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/prop_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/prop.png";
	} else if(type.indexOf("concept") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/skin/images/skosConcept_imported.png";
		else
			imgType = "chrome://semantic-turkey/skin/images/skosConcept.png";		
	} else if (type.indexOf("literal") != -1) {
		// vedere se mettere img o no
		imgType = "";
	} else if (type.indexOf("bnodes") != -1) {
		// vedere se mettere img o no
		imgType = "";
	}
	return imgType;
};

/**
 * @author Noemi Andrea invoke get Class Description Request that show the
 *         description of selected class
 */
art_semanticturkey.classesTreedoubleClick = function(event) {
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	tree.treeBoxObject.view.toggleOpenState(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var numInst = treecell.getAttribute("numInst");
	var className = currentelement.getAttribute("className");
	var parameters = new Object();
	parameters.sourceType = "cls";
	parameters.sourceElement = currentelement;
	parameters.sourceElementName = className;
	parameters.numInst = numInst;
	// NScarpato 14/03/2008 add deleteForbidden attribute
	parameters.deleteForbidden = treecell.getAttribute("deleteForbidden");
	// NScarpato 26/06/2007 remove ParentName attribute
	var parent = treecell.parentNode.parentNode.parentNode.parentNode;
	var parentcell = parent.getElementsByTagName('treecell')[0];
	var parentLabel = parentcell.getAttribute("label");
	if (parentLabel.indexOf('(') > -1) {
		parentLabel = parentLabel.substring(0, parentLabel.indexOf('('));
	}
	// if (event.target.getAttribute("isRootNode") == "false") {
	parameters.sourceParentElementName = parentLabel;
	// } else {
	// parameters.sourceParentElementName = "owl:Thing";
	// }
	parameters.list = document.getElementById('IndividualsList');
	parameters.tree = document.getElementById('classesTree');
	parameters.parentWindow = window;
	parameters.isFirstEditor = true;
	window.openDialog(
			"chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank",
			"chrome,dependent,dialog,modal=yes,resizable,centerscreen",
			parameters);
};

/**
 * @author Noemi Andrea invoke create Individual request
 */
art_semanticturkey.createIndividual = function() {
	var tree = document.getElementById("classesTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please select a class");
		return;
	}
	var currentelement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var parameters = new Object();
	parameters.name = currentelement.getAttribute("className");
	parameters.parentWindow = window;
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/createIndividual/createIndividual.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);

};
/**
 * Create Instance event handler
 */
art_semanticturkey.createInstance_RESPONSE = function(responseArray) {
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	var classRes = responseArray["class"];
	var className = classRes.getURI();
	var numInst = classRes.numInst;
	for (var i = 0; i < childList.length; i++) {
		//art_semanticturkey.checkAndCreateInstance(className, numInst,
		//		childList[i]);
	}
	art_semanticturkey.classesTreeClick("");
};

/* It seems that this is not used anymore
art_semanticturkey.checkAndCreateInstance = function(clsName, numInst, node) {
	var className = node.getAttribute("className");
	//alert("dentro checkAndCreateInstance e className = "+className+" , clsName = "+clsName); // da cancellare
	if (className == clsName) {
		node.getElementsByTagName("treecell")[0].setAttribute("numInst",
				numInst);
		var newLabel = className + "(" + numInst + ")";
		node.getElementsByTagName("treecell")[0]
				.setAttribute("label", newLabel);
	}
};*/
