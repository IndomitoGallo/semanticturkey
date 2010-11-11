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

art_semanticturkey.associateOntologySearchEventsOnGraphicElements = function(
		types) {
	if (types == "clsNInd") {
		document.getElementById("ontosearch").addEventListener("keypress",
				art_semanticturkey.ontoSearch_clsNInd, true);
	} else if (types == "property") {
		document.getElementById("ontosearch_prop").addEventListener("keypress",
				art_semanticturkey.ontoSearch_prop, true);
	}
};
art_semanticturkey.ontoSearch_clsNInd = function(event) {
	var types = "clsNInd";
	art_semanticturkey.ontoSearch(event, types);
};

art_semanticturkey.ontoSearch_prop = function(event) {
	var types = "property";
	art_semanticturkey.ontoSearch(event, types);
};
/**
 * @author Noemi 13/01/2010 invoke ontoSearch request for class and instance
 */
art_semanticturkey.ontoSearch = function(event, types) {
	try {
		// 13 is enter key code
		if (event.keyCode == 13) {
			if (types == "clsNInd") {
				var inputString = document.getElementById("ontosearch").value;
			} else {
				var inputString = document.getElementById("ontosearch_prop").value;
			}
			var responseXML = art_semanticturkey.STRequests.OntoSearch
					.searchOntology(inputString, types);
			art_semanticturkey.OntoSearch_RESPONSE(responseXML, types);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.OntoSearch_RESPONSE = function(responseElement, types) {
	var foundList = responseElement.getElementsByTagName('found');
	if (foundList.length > 1) {
		// var callPanel = parameters.callPanel;
		var parameters = new Object();
		parameters.foundList = foundList;
		parameters.parentWindow = window;
		parameters.types = types;
		window
				.openDialog(
						"chrome://semantic-turkey/content/ontologySearch/searchResults.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
	} else if (foundList.length == 1) {
		var resType = foundList[0].getAttribute("type");
		var resName = foundList[0].getAttribute("name");
		var typeName = "";
		if (resType == "owl:Individual") {
			try {
				var responseXML = art_semanticturkey.STRequests.Individual
						.get_directNamedTypes(resName);
				typeName = responseXML.getElementsByTagName("Type")[0]
						.getAttribute("qname");
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}
		var myTree = null;
		var myList = null;
		if (types == "clsNInd") {
			myTree = document.getElementById("classesTree");
			myList = document.getElementById("IndividualsList");
		} else if (types == "property") {
			myTree = document.getElementById("propertiesTree");
		}
		art_semanticturkey.searchFocus(myTree, myList, resType, resName,
				typeName);
	} else if (foundList.length == 0) {
		alert("No match found");
	}
};

/**
 * NScarpato 23/05/2007 This function focus result element to ontologySearch
 * Nscarpato 27/05/2007 add param tree to make function for all trees Nscarpato
 * 04/03/2008 change search focus
 * 
 * @param
 */
art_semanticturkey.searchFocus = function(myTree, myList, resType, resName,
		typeName) {
	if (resType == "owl:Individual") {
		art_semanticturkey.selectElementClass(myTree, typeName);
		try {
			var responseXML = art_semanticturkey.STRequests.Cls
					.getClassAndInstancesInfo(typeName);
			art_semanticturkey.getInstanceList_RESPONSE(responseXML, myList);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
		var index = 0;
		while (myList.getItemAtIndex(index) != null) {
			if (myList.getItemAtIndex(index).label == resName) {
				myList.selectedIndex = index;
				myList.scrollToIndex(index);
				break;
			}
			index++;
		}
	} else if (resType == "Class") {
		art_semanticturkey.selectElementClass(myTree, resName);
		var responseXML = art_semanticturkey.STRequests.Cls
				.getClassAndInstancesInfo(resName);
		art_semanticturkey.getInstanceList_RESPONSE(responseXML, myList);

	} else if (resType == "lexicalization") {
		// TODO Mancano le lexicalization nella ricerca
	} else if (resType.indexOf("Property")) {
		art_semanticturkey.selectElementClass(myTree, resName);
	}

};
art_semanticturkey.selectElementClass = function(myTree, resName) {
	var visible = false;

	while (visible == false) {
		var treeitemLists = myTree.getElementsByTagName("treeitem");
		for (var index = 0; index < treeitemLists.length; index++) {
			var current = treeitemLists[index];
			var treerow = current.getElementsByTagName('treerow')[0];
			var treecell = treerow.getElementsByTagName('treecell')[0];
			var label = treecell.getAttribute("label");
			if (label.indexOf('(') > -1) {
				label = label.substring(0, label.indexOf('('));
			}
			if (label == resName) {
				var pi = current;
				var pTreecell = treecell;
				while (pTreecell.getAttribute("isRootNode") == "false") {
					pi = pi.parentNode.parentNode;
					pTreecell = pi.getElementsByTagName('treecell')[0];
					pi.setAttribute("open", true);
					index = myTree.contentView.getIndexOfItem(current);
				}
				myTree.view.selection.clearSelection();
				myTree.view.selection.toggleSelect(index);
				myTree.boxObject.scrollToRow(index);
				visible = true;
				return;
			}
		}
		var parentName = resName;
		var pvisible = false;
		while (pvisible == false) {
			var responseXML = art_semanticturkey.STRequests.Cls
					.getSuperClasses(parentName);
			var parentNameList = responseXML.getElementsByTagName('SuperType');
			parentName = parentNameList[0].getAttribute("resource");
			var treeitemLists = myTree.getElementsByTagName("treeitem");
			for (var index = 0; index < treeitemLists.length; index++) {
				var current = treeitemLists[index];
				var treerow = current.getElementsByTagName('treerow')[0];
				var treecell = treerow.getElementsByTagName('treecell')[0];
				var treechildern = current.getElementsByTagName("treechildren")[0];
				var label = treecell.getAttribute("label");
				if (label.indexOf('(') > -1) {
					label = label.substring(0, label.indexOf('('));
				}
				if (label == parentName) {
					current.setAttribute("open", true);
					var responseXML = art_semanticturkey.STRequests.Cls
							.getSubClasses(parentName, true, true);
					art_semanticturkey.getSubClassesTree_RESPONSE(responseXML,
							treechildern);
					pvisible = true;
				}
			}
		}
	}
};