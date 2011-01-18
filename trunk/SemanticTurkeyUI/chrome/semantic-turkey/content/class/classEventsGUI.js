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
	//var stIsStarted = art_semanticturkey.ST_started.getStatus();
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
	//document.getElementById("menuItemGraph").addEventListener("command",
	//		art_semanticturkey.partialGraph, true);
};


art_semanticturkey.getClassesInfoAsRootsForTree_RESPONSE = function(responseElement){
	var rootTreechildren = document.getElementById('rootClassTreeChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var classList = dataElement.getElementsByTagName("class");
	for(var i=0; i<classList.length; ++i){
		art_semanticturkey.parsingSubClass(classList[i], rootTreechildren, true);
	}
	
	//open the owl:Thing node if it is the only node
	if(classList.length == 1){ 
		var treeItemThing = rootTreechildren.getElementsByTagName("treeitem")[0];
		var tree = document.getElementById("classesTree");
		tree.view.selection.clearSelection();
		tree.view.selection.toggleSelect(0);
		
		try{
			var treeChildren = treeItemThing.getElementsByTagName("treechildren")[0];
			var responseXML=art_semanticturkey.STRequests.Cls.getSubClasses("http://www.w3.org/2002/07/owl#Thing",true,true);
			art_semanticturkey.getSubClassesTree_RESPONSE(responseXML,treeChildren);
			tree.treeBoxObject.view.toggleOpenState(tree.currentIndex);
			
			var list = document.getElementById("IndividualsList");
			responseXML = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo("http://www.w3.org/2002/07/owl#Thing", true);
			art_semanticturkey.getClassAndInstancesInfo_RESPONSE(responseXML, list);
		}
		catch (e) {
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

art_semanticturkey.getSubClassesTree_RESPONSE = function(responseElement,
		rootTreechildren) {
	var rootTreechildren = rootTreechildren;
	var isRootNode = false;
	if (typeof rootTreechildren == 'undefined'){
		rootTreechildren = document.getElementById('rootClassTreeChildren');
		isRootNode = true;
	}
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var classList = dataElement.childNodes;
	for (var i = 0; i < classList.length; i++) {
		if (classList[i].nodeType == 1) {
			art_semanticturkey.parsingSubClass(classList[i], rootTreechildren,
					isRootNode);
		}
	}
};

art_semanticturkey.parsingSubClass = function(classNode, node, isRootNode) {
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
	var more = classNode.getAttribute("more");
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
	//var more = classNode.getAttribute("more");
	 var subClassList = classNode.getElementsByTagName("SubClasses")[0].childNodes;
	if (subClassList.length > 0) {
	//if (more == "1") {
		ti.appendChild(tch);
		ti.setAttribute("container", true);
		ti.setAttribute("open", false);
		
		 for ( var i = 0; i < subClassList.length; i++) { if
		 (subClassList[i].nodeName == "Class")
		  art_semanticturkey.parsingClass(subClassList[i], tch, false); }
		 
	} else {
		ti.setAttribute("container", false);
	}
	// }
	// TODO in the future it may be possible to choose the style of tree
	// (with or without instances)
	/*
	 * if (classList[i].nodeName == "Instances") { instanceNodes =
	 * classList[i].childNodes; for ( var j = 0; j < instanceNodes.length; j++) {
	 * if (instanceNodes[j].nodeType == 1) { var trInst =
	 * document.createElement("treerow"); var tcInst =
	 * document.createElement("treecell"); tcInst.setAttribute("properties",
	 * "individual"); tcInst.setAttribute("label", instanceNodes[j]
	 * .getAttribute("name")); trInst.appendChild(tcInst); var tiInst =
	 * document.createElement("treeitem"); tiInst.appendChild(trInst);
	 * tch.appendChild(tiInst); } } }
	 */

	// NScarpato 12/07/07 change ClassTree visualization on closed mode
	// TODO in the future it may be possible to choose the style of tree
	// (with or without instances)
	/*
	 * else if (instanceNodes != null && instanceNodes.length > 0) {
	 * ti.setAttribute("open", false); ti.setAttribute("container", true); }
	 */
};

art_semanticturkey.onKeyPressed = function(event){
	var keyCode = event.keyCode;
	var tree = document.getElementById("classesTree");
	
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		return;
	}
	art_semanticturkey.openSubClassesList(event);
	art_semanticturkey.loadInstanceList(event);
}

art_semanticturkey.openSubClassesList = function(event,tree) {
	var action = "null";
	var tree = tree;
	if (typeof tree == 'undefined')
		tree = document.getElementById("classesTree");
	var treeitem;
	if(event.type == "keypress"){
		var keyCode = event.keyCode;
		treeitem = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
		var isContainer = treeitem.getAttribute("container");
		if (isContainer == "false") {
			return;
		}
		var isOpen = treeitem.getAttribute("open");
		if(keyCode == KeyEvent.DOM_VK_RETURN) {
			if(isOpen == "true"){
				action = "loadSubTree";
			}
			else if(isOpen == "false"){
				action = "emptySubTree";
			}
		}
		else if((keyCode == KeyEvent.DOM_VK_RIGHT) && (isOpen == "true")){
			action = "loadSubTree";
		}
		else if  ((keyCode == KeyEvent.DOM_VK_LEFT) && (isOpen == "false")){
			action = "emptySubTree";
		}
		else{
			return;
		}
	}
	else if(event.type == "click"){
		var row = {};
		var col = {};
		var part = {};
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
	}
	else{
		return
	}
	
	//do the requested action
	var treeChildren = treeitem.getElementsByTagName("treechildren")[0];
	if(action == "loadSubTree"){
		// EMPTY TREE, just to be extra sure
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		var className = treeitem.getAttribute("className");
		var responseXML=art_semanticturkey.STRequests.Cls.getSubClasses(className,true,true);
		art_semanticturkey.getSubClassesTree_RESPONSE(responseXML,treeChildren);
	}
	else if(action == "emptySubTree"){
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
	}
	
}

art_semanticturkey.loadInstanceList = function(event,tree,list) {
	if (event.type == "keypress") {
		var keyCode = event.keyCode;
		if((keyCode != KeyEvent.DOM_VK_UP) && (keyCode == KeyEvent.DOM_VK_DOWN) &&
				(keyCode != KeyEvent.DOM_VK_LEFT) && (keyCode == KeyEvent.DOM_VK_RIGHT)){
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
	//if (numInst > 0) {
		try {
			var responseXML = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo(className, true);
			art_semanticturkey.getClassAndInstancesInfo_RESPONSE(responseXML, list);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	/*} else {
		var rows = list.getRowCount();
		while (rows--) {
			list.removeItemAt(rows);
		}
		list.getElementsByTagName('listheader')[0]
				.getElementsByTagName('listitem-iconic')[0]
				.getElementsByTagName('label')[0].setAttribute("value",
				"Instances of " + className);
	}*/
	
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
			var responseXML = art_semanticturkey.STRequests.Delete
					.removeClass(name);
			art_semanticturkey.removeClass_RESPONSE(responseXML);
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


art_semanticturkey.removeClass_RESPONSE = function(responseElement) {
	var resourceElement = responseElement.getElementsByTagName('Resource')[0];
	var removedClassName = resourceElement.getAttribute("name");
	
	art_semanticturkey.evtMgr.fireEvent("removedClass", (new art_semanticturkey.classRemovedClass(removedClassName)) );
	
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
				"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
				parameters);
	} else {
		alert("You cannot modify this class, it's a system resource!");
	}
};

art_semanticturkey.renameResource_RESPONSE = function(responseElement,resourceType){
	var resourceElement = responseElement
			.getElementsByTagName('UpdateResource')[0];
	var newResourceName = resourceElement.getAttribute("newname");
	var oldResourceName = resourceElement.getAttribute("name");
	if(resourceType=="class"){
		art_semanticturkey.evtMgr.fireEvent("renamedClass", (new art_semanticturkey.classRenamedClass(newResourceName, oldResourceName)) );
	}else if(resourceType=="individual"){
		art_semanticturkey.evtMgr.fireEvent("renamedIndividual", (new art_semanticturkey.individualRenamedIndividual(newResourceName, oldResourceName)) );
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

art_semanticturkey.addClass_RESPONSE = function(responseElement) {

	var superClassElement = responseElement.getElementsByTagName('superclass')[0];
	var superClassName = superClassElement.getAttribute("name");
	var classElement = responseElement.getElementsByTagName('class')[0];
	var className = classElement.getAttribute("name");
	
	art_semanticturkey.evtMgr.fireEvent("createdSubClass", (new art_semanticturkey.classAddedClass(className, superClassName)) );
	/*if (superClassName == "owl:Thing") {
		var rootNode = document.getElementById('rootClassTreeChildren');
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		tc.setAttribute("numInst", "0");
		tc.setAttribute("deleteForbidden", false);
		//tc.setAttribute("isRootNode", true);
		tc.setAttribute("isRootNode", false);
		tc.setAttribute("label", className);
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute("className", className);
		ti.appendChild(tr);
		rootNode.appendChild(ti);
	} else {*/
	/*var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndCreate(className, childList[i],
				superClassName);
	}*/
	//}
};


//TODO da eliminare, visto che tale funzione qui non dovrebbe esistere
/*art_semanticturkey.checkAndCreate = function(className, parentNode,
		superClassName) {
	var parentClassName = parentNode.getAttribute("className");
	if (parentClassName == superClassName) {
		var parentTreeChildren = parentNode
				.getElementsByTagName("treechildren")[0];
		if (parentTreeChildren == null) {
			parentTreeChildren = document.createElement("treechildren");
			parentNode.appendChild(parentTreeChildren);
			parentNode.setAttribute("container", true);
			parentNode.setAttribute("open", true);
		}
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		tc.setAttribute("numInst", "0");
		tc.setAttribute("deleteForbidden", false);
		tc.setAttribute("isRootNode", false);
		tc.setAttribute("label", className);
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute("className", className);
		ti.appendChild(tr);
		parentTreeChildren.appendChild(ti);
	}
};*/

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
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
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
		art_semanticturkey.STRequests.Graph
				.partialGraph(className);
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
		//document.getElementById("menuItemGraph").disabled = true;
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
	//document.getElementById("menuItemGraph").disabled = false;
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
	if(typeof event != 'undefined'){
		art_semanticturkey.openSubClassesList(event,tree);
		art_semanticturkey.loadInstanceList(event,tree,list);
	}
};

art_semanticturkey.getClassAndInstancesInfo_RESPONSE = function(responseElement, list) {
	var list = list;
	if (typeof list == 'undefined')
		list = document.getElementById("IndividualsList");
	var rows = list.getRowCount();
	while (rows--) {
		list.removeItemAt(rows);
	}
	var parentClassName = responseElement.getElementsByTagName('Class')[0]
			.getAttribute("name");
	var numTotInst = responseElement.getElementsByTagName('Class')[0]
			.getAttribute("numTotInst");
	var hasSubClasses =  responseElement.getElementsByTagName('Class')[0]
			.getAttribute("more"); // this can be "1" or "0" or null
	
	var classTree = document.getElementById("classesTree");
	var childList = classTree.getElementsByTagName("treeitem");
	for (var i = 0; i < childList.length; i++) {
		if(childList[i].getAttribute("className") == parentClassName){
			if(hasSubClasses != null) {
				var isAlreadyContainer = childList[i].getAttribute("container");
				var isOpen = childList[i].getAttribute("open");
				if(hasSubClasses == "1"){
					childList[i].setAttribute("container", true);
					if(isAlreadyContainer == false)
						childList[i].setAttribute("open", false);
				}
				else{ // == 0
					childList[i].setAttribute("container", false);
				}
			}
			var treecell = childList[i].getElementsByTagName("treecell")[0];
			treecell.setAttribute("numInst", numTotInst);
			if(numTotInst > 0)
				treecell.setAttribute("label", parentClassName+"("+numTotInst+")");
			else
				treecell.setAttribute("label", parentClassName);
		}
	}		
			
			
	list.getElementsByTagName('listheader')[0]
			.getElementsByTagName('listitem-iconic')[0]
			.getElementsByTagName('label')[0].setAttribute("value",
			"Instances of " + parentClassName);
	list.getElementsByTagName('listheader')[0].setAttribute("parentCls",
			parentClassName);
	list.getElementsByTagName('listheader')[0].setAttribute("numTotInst",
			numTotInst);
	var instancesList = responseElement.getElementsByTagName('Instance');
	for (var i = 0; i < instancesList.length; i++) {
		var instName = instancesList[i].getAttribute("name");
		var lsti = document.createElement("listitem");
		lsti.setAttribute("label", instName);
		// NScarpato 14/04/2008 add explicit attribute for instances
		// list
		var explicit = instancesList[i].getAttribute("explicit");
		lsti.setAttribute("explicit", explicit);
		lsti.setAttribute("parentCls", parentClassName);
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		var type = instancesList[i].getAttribute("type");
		lsti.setAttribute("type",type);
		img.setAttribute("src", art_semanticturkey.getImgFromType(type, explicit));
		
		lci.appendChild(img);
		var lbl = document.createElement("label");
		lbl.setAttribute("value", instName);
		lbl.setAttribute("id", instName);
		lbl.setAttribute("class", "base");
		lci.appendChild(lbl);
		lsti.appendChild(lci);
		list.appendChild(lsti);
	}

};

art_semanticturkey.getImgFromType = function(type, explicit){
	var imgType;
	if (type == "individual") {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/content/images/individual_noexpl.png";
		else 
			imgType = "chrome://semantic-turkey/content/images/individual.png";
	} else if (type == "cls") {
		if (explicit == "false") 
			imgType = "chrome://semantic-turkey/content/images/class_imported.png";
		else 
			imgType = "chrome://semantic-turkey/content/images/class.png";
	} else if (type.indexOf("ObjectProperty") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/content/images/propObject_imported.png";
		else
			imgType = "chrome://semantic-turkey/content/images/propObject20x20.png";
	}else if (type.indexOf("DatatypeProperty") != -1) {
		if (explicit == "false") 
			imgType = "chrome://semantic-turkey/content/images/propDatatype_imported.png";
		else
			imgType = "chrome://semantic-turkey/content/images/propDatatype20x20.png";
	}else if (type.indexOf("AnnotationProperty") != -1) {
		if (explicit == "false") 
			imgType = "chrome://semantic-turkey/content/images/propAnnotation_imported.png";
		else
			imgType = "chrome://semantic-turkey/content/images/propAnnotation20x20.png";
	}else if (type.indexOf("Property") != -1) {
		if (explicit == "false")
			imgType = "chrome://semantic-turkey/content/images/prop_imported.png";
		else
			imgType = "chrome://semantic-turkey/content/images/prop.png";
	}else if (type.indexOf("literal") != -1) {
		//vedere se mettere img o no
		imgType="";
	}else if (type.indexOf("bnodes") != -1) {
		//vedere se mettere img o no
		imgType="";
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
	//if (event.target.getAttribute("isRootNode") == "false") {
		parameters.sourceParentElementName = parentLabel;
	//} else {
	//	parameters.sourceParentElementName = "owl:Thing";
	//}
	parameters.list = document.getElementById('IndividualsList');
	parameters.tree = document.getElementById('classesTree');
	parameters.parentWindow = window;
	parameters.isFirstEditor = true;
	window.openDialog(
			"chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
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
	parameters.name = treecell.getAttribute("label");
	parameters.parentWindow = window;
	window
			.openDialog(
					"chrome://semantic-turkey/content/class/createIndividual/createIndividual.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);

};
/**
 * Create Instance event handler
 */
art_semanticturkey.createInstance_RESPONSE = function(responseElement) {
	var tree = document.getElementById("classesTree");
	var childList = tree.getElementsByTagName("treeitem");
	var className = responseElement.getElementsByTagName("Class")[0]
			.getAttribute("clsName");
	var numInst = responseElement.getElementsByTagName("Class")[0]
			.getAttribute("numTotInst");

	for (var i = 0; i < childList.length; i++) {
		art_semanticturkey.checkAndCreateInstance(className, numInst,
				childList[i]);
	}
	art_semanticturkey.classesTreeClick("");
};

art_semanticturkey.checkAndCreateInstance = function(clsName, numInst, node) {
	var className = node.getAttribute("className");
	if (className == clsName) {
		node.getElementsByTagName("treecell")[0].setAttribute("numInst",
				numInst);
		var newLabel = className + "(" + numInst + ")";
		node.getElementsByTagName("treecell")[0]
				.setAttribute("label", newLabel);
	}
};
