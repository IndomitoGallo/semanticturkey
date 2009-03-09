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

/** NScarpato */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

/**
 * @author NScarpato 10/03/2008 setPanel
 * @param {}
 */
function setPanel() {
	win = document.getElementById("properties");
	win.setAttribute("title", window.arguments[0].winTitle);
	predicatePropertyName = window.arguments[0].predicatePropertyName;
	subjectInstanceName = window.arguments[0].subjectInstanceName;
	objectInstanceName = window.arguments[0].objectInstanceName;
	objectClsName = window.arguments[0].objectClsName;
	panelTree = window.arguments[0].panelTree;
	pageTitle = window.arguments[0].pageTitle;
	if (window.arguments[0].action != null) {
		sourceElementName = window.arguments[0].sourceElementName;
		getBindBtn().setAttribute("label", "Create and add Property Value");
		getAddBtn().setAttribute("label", "Add Existing Property Value");
	}
	// NScarpato 24/05/2007 add subtree
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName="
			+ encodeURIComponent(predicatePropertyName));
	searchFocus("Class", objectClsName, "", "");
}

// NScarpato 24/05/2007 add new annotation AND new instance bind function ("bind
// to new individual for selected class")
function bind() {
	var tree = getthetree();
	if (tree.currentIndex != -1) {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
		var treerow = currentelement.getElementsByTagName('treerow')[0];
		var treecell = treerow.getElementsByTagName('treecell')[0];
		var objectClsName2 = treecell.getAttribute("label");
		if (objectClsName2.indexOf('(') > -1) {
			objectClsName2 = objectClsName2.substring(0, objectClsName2
							.indexOf('('));
		}
		if (window.arguments[0].action != null) {
			parameters = new Object();
			parameters.parentBox = window.arguments[0].parentBox;
			parameters.rowBox = window.arguments[0].rowBox;
			parameters.sourceElementName = sourceElementName;
			propValue = null;
			propValue = prompt("Insert new property value:", "",
					"Create and add property value");
			if (propValue != null) {
				parameters.propValue = propValue;
				httpGetP(
						"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="
								+ encodeURIComponent(sourceElementName)
								+ "&propertyQName="
								+ encodeURIComponent(predicatePropertyName)
								+ "&value="
								+ encodeURIComponent(propValue)
								+ "&rangeClsQName="
								+ encodeURIComponent(objectClsName2), false,
						parameters);
			}
		} else {
			httpGet(
					"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=relateAndAnnotate&instanceQName="
							+ encodeURIComponent(subjectInstanceName)
							+ "&propertyQName="
							+ encodeURIComponent(predicatePropertyName)
							+ "&objectQName="
							+ encodeURIComponent(objectInstanceName)
							+ "&objectClsName="
							+ encodeURIComponent(objectClsName2)
							+ "&urlPage="
							+ encodeURIComponent(window.arguments[0].urlPage)
							+ "&title="
							+ encodeURIComponent(pageTitle)
							+ "&op=bindCreate", false);
		}
		close();
	} else {
		alert("No range class selected")
	}
}
// NScarpato 28/05/2007 add sole annotate function ("add new annotation for
// selected instance")
// NScarpato 10/03/2008 add annotate function "addExistingPropValue"
function annotateInst() {
	var myList = gettheList();
	selItem = myList.selectedItem;
	instanceName = selItem.label;
	if (window.arguments[0].action != null) {
		parameters = new Object();
		parameters.parentBox = window.arguments[0].parentBox;
		parameters.rowBox = window.arguments[0].rowBox;
		parameters.propValue = instanceName;
		parameters.sourceElementName = sourceElementName;
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addExistingPropValue&instanceQName="
						+ encodeURIComponent(sourceElementName)
						+ "&propertyQName="
						+ encodeURIComponent(predicatePropertyName)
						+ "&value="
						+ encodeURIComponent(instanceName), false, parameters);
	} else {
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotation&request=relateAndAnnotate&instanceQName="
						+ encodeURIComponent(subjectInstanceName)
						+ "&propertyQName="
						+ encodeURIComponent(predicatePropertyName)
						+ "&objectQName="
						+ encodeURIComponent(instanceName)
						+ "&lexicalization="
						+ encodeURIComponent(objectInstanceName)
						+ "&urlPage="
						+ encodeURIComponent(window.arguments[0].urlPage)
						+ "&title="
						+ encodeURIComponent(pageTitle)
						+ "&op=bindAnnot", false);

	}
	close();
}
function showAllClasses() {
	sel = document.getElementById("checkAll");
	if (sel.getAttribute("checked")) {
		var treeChildren = getthetree().getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=cls");
	} else {
		var treeChildren = getthetree().getElementsByTagName('treechildren')[0];
		treeItemsNodes = treeChildren.getElementsByTagName("treeitem");
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName="
				+ encodeURIComponent(predicatePropertyName));
	}
}
function onCancel() {
	window.arguments[0].oncancel = true;
	window.close();
}
