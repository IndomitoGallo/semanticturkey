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
function addImport() {
	selectItem = document.getElementById("import").selectedIndex;
	selectLabel = document.getElementById("import").selectedItem
			.getAttribute("label");
	if (selectItem == 0) {
		alert("Please select a import type");
	} else {
		var parameters = new Object();
		parameters.selectItem = selectItem;
		parameters.selectLabel = selectLabel;
		parameters.importsTree = getImportsTree();
		parameters.namespaceTree = getNamespaceTree();
		parameters.importsBox = document.getElementById("importsBox");
		if (selectItem == 4) {
			var parameters = new Object();
			parameters.importsTree = getImportsTree();
			parameters.namespaceTree = getNamespaceTree();
			parameters.importsBox = document.getElementById("importsBox");
			// NScarpato 03/03/2008 add import from mirror
			window
					.openDialog(
							"chrome://semantic-turkey/content/selectFileFromMirror.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							parameters);
		} else {
			window.openDialog("chrome://semantic-turkey/content/addImport.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
		}
		// window.openDialog("chrome://semantic-turkey/content/fileChooser.xul","_blank","modal=yes,resizable,centerscreen",parameters);
	}
}
// NScarpato 19/07/2007 add imports tree
// httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports");
function getNamespaceTree() {
	return document.getElementById('namespaceTree');
}
function getImportsTree() {
	return document.getElementById('importsTree');
}
// NScarpato 03/10/2007
function removeImport() {
	var tree = document.getElementById("importsTree");
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var uri = treecell.getAttribute("label");
	var parameters = new Object();
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	parameters.importsBox = document.getElementById("importsBox");
	parameters.actionType = "removeImport";
	httpGetP(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=removeImport&uri="
					+ encodeURIComponent(uri), false, parameters);
}
/**
 * addPrefix
 * 
 */
function addPrefix() {
	var parameters = new Object();
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	parameters.importsBox = document.getElementById("importsBox");
	window.openDialog("chrome://semantic-turkey/content/add_prefix.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
}

function removePrefix() {
	var tree = getNamespaceTree();
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var explicit = treerow.getAttribute("explicit");
	if (explicit == "true") {
		var treecell = treerow.getElementsByTagName('treecell')[1];
		var namespace = treecell.getAttribute("label");
		var parameters = new Object();
		parameters.importsTree = tree;
		parameters.namespaceTree = getNamespaceTree();
		parameters.importsBox = document.getElementById("importsBox");
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=remove_nsprefixmapping&namespace="
						+ encodeURIComponent(namespace), false, parameters);
	} else {
		alert("this namespace-prefix mapping cannot be deleted since it is being used by one of the imported ontologies");
	}
}
function changePrefix() {
	var tree = getNamespaceTree();
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var explicit = treerow.getAttribute("explicit");
	// if(explicit=="true"){
	var parameters = new Object();
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var prefix = treecell.getAttribute("label");
	var treecell1 = treerow.getElementsByTagName('treecell')[1];
	var namespace = treecell1.getAttribute("label");
	parameters.oldPrefix = prefix;
	parameters.namespace = namespace;
	parameters.importsBox = document.getElementById("importsBox");
	window.openDialog("chrome://semantic-turkey/content/change_prefix.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	/*
	 * }else{ alert("You cannot change this prefix, it's a prefix that belongs
	 * to the top ontology!"); }
	 */
}

function populateImportPanel() {
	changed = false;
	parameters = new Object();
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	parameters.importsBox = document.getElementById("importsBox");
	// httpGetC("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",false,parameters);
	// httpGetC("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",false,parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_nsprefixmappings",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_imports",
			false, parameters);
	// get per prendere default ns e baseuri
	parameters = new Object();
	parameters.ns = "none";
	parameters.baseuri = "none";
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_defaultnamespace",
			false, parameters);
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=get_baseuri",
			false, parameters);
	var baseUriTxtBox = document.getElementById("baseUriTxtBox");
	var nsTxtBox = document.getElementById("nsTxtBox");
	if (parameters.ns != "none") {
		nsTxtBox.setAttribute('value', parameters.ns);
	}
	if (parameters.baseuri != "none") {
		baseUriTxtBox.setAttribute('value', parameters.baseuri);
	}
	baseUriTxtBox.setAttribute("onkeyup", "manageInput('base',this);");
	nsTxtBox.setAttribute("onkeyup", "manageInput('ns',this);");
	baseUriTxtBox.setAttribute("onkeypress", "checkEnter(event,'base',this);");
	nsTxtBox.setAttribute("onkeypress", "checkEnter(event,'ns',this);");
}

/**
 * NScarpato 25/03/2008 show or hidden contextmenu's items in particular the
 * remove item that it's shown only if the ontology it's root ontology
 */
function showHideItems() {
	tree = getImportsTree();
	currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	treerow = currentelement.getElementsByTagName('treerow')[0];
	stato = treerow.getAttribute("properties");
	document.getElementById("mirror").hidden = true;
	document.getElementById("downloadFromWebToMirror").hidden = true;
	document.getElementById("downloadFromWeb").hidden = true;
	document.getElementById("getFromLocalFile").hidden = true;
	document.getElementById("remove").hidden = true;
	// NScarpato add function for mirror ontologies and download if is failed
	if (stato == "web") {
		document.getElementById("mirror").hidden = false;
	} else if (stato == "failed") {
		document.getElementById("downloadFromWebToMirror").hidden = false;
		document.getElementById("downloadFromWeb").hidden = false;
		document.getElementById("getFromLocalFile").hidden = false;
	}
	isRoot = treerow.getAttribute("isRoot");
	if (isRoot == "true") {
		document.getElementById("remove").hidden = false;
	}
}
/**
 * downloadFailedImport
 * 
 * @param int
 *            selectedDownload
 */
function downloadFailedImport(selectDownload, selectLabel) {
	var parameters = new Object();
	parameters.selectItem = selectDownload;
	parameters.selectLabel = selectLabel;
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	parameters.importsBox = document.getElementById("importsBox");
	window.openDialog("chrome://semantic-turkey/content/addImport.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
}
/**
 * mirrorOntology
 * 
 * @param
 */
function mirrorOntology() {
	var parameters = new Object();
	parameters.importsTree = getImportsTree();
	parameters.namespaceTree = getNamespaceTree();
	treecell = treerow.getElementsByTagName('treecell')[0];
	uri = treecell.getAttribute("label");
	mirrorname = prompt("Insert the name of new mirror file");
	httpGetP(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=metadata&request=mirrorOntology&baseuri="
					+ encodeURIComponent(uri)
					+ "&mirrorFile="
					+ encodeURIComponent(mirrorname), false, parameters);
}
