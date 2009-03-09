
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

/*
 * var Annotator = new Object();
 * 
 * Annotator.view = function() {
 * window.openDialog("chrome://semantic-turkey/content/annotator.xul","_blank","modal=yes,resizable,centerscreen"); }
 */
function showAllProperties() {
	sel = document.getElementById("checkAll");
	var treeChildren = getthetree().getElementsByTagName('treechildren')[0];
	if (sel.getAttribute("checked")) {

		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property");
	} else {

		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=getIndDescription&instanceQName="
				+ encodeURIComponent(subjectInstanceName) + "&method=template");
	}
}
function onAccept() {
	var tree = getthetree();
	var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();
	var parameters;
	for (var t = 0; t < numRanges; t++) {
		tree.view.selection.getRangeAt(t, start, end);
		for (var v = start.value; v <= end.value; v++) {
			parameters = getParameters(tree, v);
		}
	}

	var sindex = 1;
	if (index == null) {
		sindex = 1;
	} else {
		sindex = document.getElementById("group").selectedIndex;
	}

	if (sindex == 0) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.info.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		AnnotFunctionList=annComponent.wrappedJSObject.getList();
		AnnotFunctionList[defaultAnnotFun][0]();
		
	} else if (sindex == 1) { // user chooses to add the annotation as a new
								// instance for a given property. A class tree
								// panel is opened on the range of the property
								// selected under
		if (parameters.propType == "ObjectProperty"
				|| parameters.propType == "ObjectProperty_noexpl") {
			parameters.oncancel = false;
			window.openDialog(
					"chrome://semantic-turkey/content/enrichProperty.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
			// NScarpato 15/04/2008
			if (parameters.oncancel == false) {
				close();
			}
		} else if (parameters.propType == "AnnotationProperty"
				|| parameters.propType == "AnnotationProperty_noexpl") {
			parameters2 = new Object();
			var lang = "";
			parameters2.lang = lang;
			window.openDialog(
					"chrome://semantic-turkey/content/languageList.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters2);
			// NScarpato 19/06/2008 add lang parameters for annotation property
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=relateAndAnnotate&instanceQName="
							+ encodeURIComponent(parameters.subjectInstanceName)
							+ "&propertyQName="
							+ encodeURIComponent(parameters.predicatePropertyName)
							+ "&objectQName="
							+ encodeURIComponent(parameters.objectInstanceName)
							+ "&objectClsName="
							+ encodeURIComponent(parameters.objectClsName)
							+ "&urlPage="
							+ encodeURIComponent(parameters.urlPage)
							+ "&title="
							+ encodeURIComponent(parameters.pageTitle)
							+ "&lang="
							+ encodeURIComponent(parameters2.lang)
							+ "&op=bindCreate", false);
			// httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&instanceQName="
			// + encodeURIComponent(parameters.subjectInstanceName) +
			// "&propertyQName="
			// +encodeURIComponent(parameters.predicatePropertyName) +
			// "&objectQName=" +
			// encodeURIComponent(parameters.objectInstanceName) +
			// "&objectClsName=" + encodeURIComponent(parameters.objectClsName)
			// + "&urlPage=" + encodeURIComponent(parameters.urlPage) +
			// "&title=" +
			// encodeURIComponent(parameters.pageTitle)+"&op=bindCreate",
			// false);
		} else {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=relateAndAnnotate&instanceQName="
							+ encodeURIComponent(parameters.subjectInstanceName)
							+ "&propertyQName="
							+ encodeURIComponent(parameters.predicatePropertyName)
							+ "&objectQName="
							+ encodeURIComponent(parameters.objectInstanceName)
							+ "&objectClsName="
							+ encodeURIComponent(parameters.objectClsName)
							+ "&urlPage="
							+ encodeURIComponent(parameters.urlPage)
							+ "&title="
							+ encodeURIComponent(parameters.pageTitle)
							+ "&op=bindCreate", false);
		}
		close();
	}

}

function getthetree() {
	return document.getElementById('annotatorTree');
}

function getPanelTree() {
	return window.arguments[0].panelTree;
}
function getParameters(tree, index) {
	var mytree = tree
	if (!mytree) {
		mytree = document.getElementById('annotatorTree')
	}
	var items = mytree.getElementsByTagName('treeitem');
	for (var i = 0; i < items.length; i++) {
		if (mytree.contentView.getIndexOfItem(items[i]) == index) {
			var parameters = new Object();
			parameters.winTitle = "Enrichment Property";
			var treerow = items[i].getElementsByTagName('treerow')[0];
			var treecell = treerow.getElementsByTagName('treecell')[0];
			// NScarpato 13/05/2007 Modificato per aggiungere pannello
			// enrichProperty
			parameters.propType = treecell.getAttribute("properties");
			parameters.objectInstanceName = objectInstanceName;
			parameters.subjectInstanceName = subjectInstanceName;
			parameters.urlPage = urlPage;
			parameters.pageTitle = pageTitle;
			parameters.predicatePropertyName = treecell.getAttribute("label");
			/*
			 * NScarpato 15/11/2007 add request for range reqparameters =new
			 * Object(); reqparameters.reqparameters=parameters;
			 * httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&propertyQName=" +
			 * encodeURIComponent(parameters.predicatePropertyName),false,reqparameters);
			 */
			// parameters.objectClsName = treecell.getAttribute("range");
			// parameters.domain = treecell.getAttribute("domain");
			parameters.panelTree = panelTree;
			return parameters;
		}
	}
	return null // Should never get here
}
function updateState() {
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
}
