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
Components.utils.import("resource://stservices/SERVICE_Individual.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

window.onload = function() {
	document.getElementById("checkAll").addEventListener("command",
			art_semanticturkey.showAllProperties, true);

	document.getElementById("annotateInstance").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);
	document.getElementById("group").addEventListener("select",
			art_semanticturkey.updateState, true);

	var objectInstanceName = window.arguments[0].objectInstanceName;
	var subjectInstanceName = window.arguments[0].subjectInstanceName;
	try {
		var responseXML = art_semanticturkey.STRequests.Individual
				.getIndividualDescription(subjectInstanceName, "template");
		art_semanticturkey.getIndividualDescription_RESPONSE(responseXML);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}

	var radiolexNode = document.getElementById("radiolex");
	radiolexNode.setAttribute("label", "\"" + objectInstanceName
			+ "\" is a further annotation of \"" + subjectInstanceName + "\"");

	var radiopropNode = document.getElementById("radioprop");
	radiopropNode.setAttribute("label", "\"" + objectInstanceName
			+ "\" is a value of a property of \""
			+ subjectInstanceName + "\"");
};

art_semanticturkey.getIndividualDescription_RESPONSE = function(responseElement) {
	var node = document.getElementById("annotatorTree").getElementsByTagName(
			'treechildren')[0];
	var propTree = responseElement.getElementsByTagName("Properties");
	var propertyList = propTree[0].childNodes;
	// NScarpato 13/06/2008 change prop server
	for ( var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			var name = propertyList[i].getAttribute("name");
			var type = propertyList[i].getAttribute("type");
			var tr = document.createElement("treerow");
			var tc = document.createElement("treecell");
			tc.setAttribute("label", name);
			tc.setAttribute("propType",type);
			type = type.substring(type.indexOf(':') + 1);
			tr.setAttribute("properties", type);
			tc.setAttribute("properties", type);
			tr.appendChild(tc);
			// NScarpato 12/05/2007 Modificato Annotator.xul
			var ti = document.createElement("treeitem");
			ti.appendChild(tr);
			node.appendChild(ti);
		}
	}
};

/*
 * var Annotator = new Object();
 * 
 * Annotator.view = function() {
 * window.openDialog("chrome://semantic-turkey/content/annotator.xul","_blank","modal=yes,resizable,centerscreen"); }
 */
art_semanticturkey.showAllProperties = function() {
	var sel = document.getElementById("checkAll");
	var tree = document.getElementById("annotatorTree");
	var treeChildren = tree.getElementsByTagName('treechildren')[0];
	var responseXML;
	if (sel.getAttribute("checked")) {

		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		try {
			responseXML = art_semanticturkey.STRequests.Property
					.getPropertyTree();
			art_semanticturkey.showAllProperties_RESPONSE(responseXML);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}

	} else {

		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		try {
			responseXML = art_semanticturkey.STRequests.Individual
					.getIndividualDescription(window.arguments[0].subjectInstanceName,
							"template");
			art_semanticturkey.getIndividualDescription_RESPONSE(responseXML);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}

};
/** Show all property response provide to show all properties */
art_semanticturkey.showAllProperties_RESPONSE = function(responseElement) {
	var node = document.getElementById('rootAnnotatorTreeChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var propertyList = dataElement.childNodes;
	for ( var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			art_semanticturkey.parsingProperties(propertyList[i], node, true);
		}
	}
};

art_semanticturkey.onAccept = function() {
	var sindex = document.getElementById("group").selectedIndex;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
			.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	if (sindex == 0) {
		AnnotFunctionList = annComponent.wrappedJSObject.getList();
		if (AnnotFunctionList[defaultAnnotFun] != null) {
			AnnotFunctionList[defaultAnnotFun]["furtherAnnotation"]();
			close();
		} else {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			prompts.alert(null, defaultAnnotFun
					+ " annotation type not registered ", defaultAnnotFun
					+ " not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate",
					"bookmarking");
		}
	} else if (sindex == 1) {
		var tree = document.getElementById("annotatorTree");
		var start = new Object();
		var end = new Object();
		var numRanges = tree.view.selection.getRangeCount();
		var parameters;
		if (numRanges == 1) {
			parameters = art_semanticturkey.getParameters(tree,
					tree.currentIndex);
			AnnotFunctionList = annComponent.wrappedJSObject.getList();
			if (AnnotFunctionList[defaultAnnotFun] != null) {
				AnnotFunctionList[defaultAnnotFun]["listDragDropEnrichProp"](parameters);
				close();
			} else {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
				prompts
						.alert(
								null,
								defaultAnnotFun
										+ " annotation type not registered ",
								defaultAnnotFun
										+ " not registered annotation type reset to bookmarking");
				prefs.setCharPref("extensions.semturkey.extpt.annotate",
						"bookmarking");
			}
		} else {
			alert("Please select a property");
		}
	}

};

art_semanticturkey.onCancel = function() {
	close();
};

art_semanticturkey.getParameters = function(tree, index) {
	var mytree = tree;
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(index);
	var parameters = new Object();
	parameters.winTitle = "Enrichment Property";
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	parameters.propType = treecell.getAttribute("propType");
	parameters.objectInstanceName = window.arguments[0].objectInstanceName;
	parameters.subjectInstanceName = window.arguments[0].subjectInstanceName;
	parameters.urlPage = window.arguments[0].urlPage;
	parameters.title = window.arguments[0].title;
	parameters.predicatePropertyName = treecell.getAttribute("label");
	parameters.parentWindow = window.arguments[0].parentWindow;
	return parameters;
};

art_semanticturkey.updateState = function() {
	index = "update";
	var sindex = document.getElementById("group").selectedIndex;
	/*
	 * if (sindex == 0) name.disabled = true; else name.disabled = false;
	 */

	var tree = document.getElementById("annotatorTree");
	if (sindex == 0) {
		tree.setAttribute("disabled", "true");
	} else {
		tree.setAttribute("disabled", "false");
	}
};
