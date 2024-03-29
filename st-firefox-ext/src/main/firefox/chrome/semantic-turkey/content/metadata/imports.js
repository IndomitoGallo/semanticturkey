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
Components.utils.import("resource://stservices/SERVICE_Metadata.jsm",
		art_semanticturkey);

Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);


art_semanticturkey.eventListenerImportsArrayObject = null;


window.onload = function() {
	
	art_semanticturkey.eventListenerImportsArrayObject = new art_semanticturkey.eventListenerArrayClass();
	art_semanticturkey.associateEventsOnGraphicElementsImports();
	
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == false){
		art_semanticturkey.populateImportPanel();
	}else{
		art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("projectOpened", art_semanticturkey.populateImportPanel, null);
	}
	
	//register the handler for the events
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("visLevelChanged", art_semanticturkey.toggleSidebarFromImports, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("projectClosed", art_semanticturkey.toggleSidebarFromImports, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("rdfLoaded", art_semanticturkey.toggleSidebarFromImports, null);
	
	art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("clearedData", art_semanticturkey.toggleSidebarFromImports, null);
};

window.onunload = function(){
	art_semanticturkey.eventListenerArrayObject.deregisterAllListener();
};

art_semanticturkey.populateImportPanel = function() {
	document.getElementById("import").disabled=false;
	document.getElementById("baseUriTxtBox").disabled=false;
	document.getElementById("nsTxtBox").disabled=false;
	document.getElementById("addPrefix").disabled=false;
	document.getElementById("removePrefix").disabled=false;
	document.getElementById("changePrefix").disabled=false;
	document.getElementById("infoOnProject").disabled= false;
	
	try{
		var responseXML = art_semanticturkey.STRequests.Metadata.getNSPrefixMappings();
		art_semanticturkey.getNSPrefixMappings_RESPONSE(responseXML);
		
		responseXML = art_semanticturkey.STRequests.Metadata.getImports();
		art_semanticturkey.getImports_RESPONSE(responseXML);
		
		responseXML = art_semanticturkey.STRequests.Metadata.getDefaultNamespace();
		art_semanticturkey.getDefaultNamespace_RESPONSE(responseXML);
		
		responseXML = art_semanticturkey.STRequests.Metadata.getBaseuri();
		art_semanticturkey.getBaseuri_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.infoProject = function(){
	//var list = document.getElementById('IndividualsList');
	//var instanceName = list.selectedItem.label;
	try{
		responseXML = art_semanticturkey.STRequests.Metadata.getBaseuri();
		var baseuri = responseXML.getElementsByTagName('BaseURI')[0].getAttribute('uri');
		
		var parameters = new Object();
		parameters.sourceType = "Ontology";
		
		//parameters.sourceElement = list.selectedItem;
		parameters.sourceElementName = baseuri;
		parameters.parentWindow = window;
		parameters.isFirstEditor = true;
		//parameters.list = document.getElementById('IndividualsList');
		//parameters.tree = document.getElementById('classesTree');
		window.openDialog("chrome://semantic-turkey/content/editors/editorPanel.xul",
				"_blank", "modal=yes,resizable,centerscreen", parameters);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};


/**
 * addPrefix
 * 
 */
art_semanticturkey.addPrefix = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	window.openDialog(
			"chrome://semantic-turkey/content/metadata/add_prefix.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.removePrefix = function() {
	var tree = document.getElementById('namespaceTree');
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var prefix = treerow.getElementsByTagName('treecell')[0].getAttribute("label");
	if(art_semanticturkey.checkPrefixEditable(prefix)  == false)
		return;
	var explicit = treerow.getAttribute("explicit");
	if (explicit == "true") {
		var treecell = treerow.getElementsByTagName('treecell')[1];
		var namespace = treecell.getAttribute("label");
		try{
			var responseXML = art_semanticturkey.STRequests.Metadata.removeNSPrefixMapping(namespace);
			art_semanticturkey.removeNSPrefixMapping_RESPONSE(responseXML);
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		alert("this namespace-prefix mapping cannot be deleted since it is being used by one of the imported ontologies");
	}
};

art_semanticturkey.changePrefix = function() {
	var tree = document.getElementById('namespaceTree');
	try {
		var currentelement = tree.treeBoxObject.view
				.getItemAtIndex(tree.currentIndex);
	} catch (e) {
		alert("No element selected");
		return;
	}
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var prefix = treerow.getElementsByTagName('treecell')[0].getAttribute("label");
	if(art_semanticturkey.checkPrefixEditable(prefix) == false)
		return;
	//var explicit = treerow.getAttribute("explicit");
	// if(explicit=="true"){
	var treecellNS = treerow.getElementsByTagName('treecell')[1];
	var namespace = treecellNS.getAttribute("label");
	var parameters = new Object();
	parameters.namespace = namespace;
	parameters.parentWindow = window;
	
	/*
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var prefix = treecell.getAttribute("label");
	parameters.importsTree = document.getElementById("importsTree");
	parameters.namespaceTree = document.getElementById('namespaceTree');
	parameters.oldPrefix = prefix;
	parameters.importsBox = document.getElementById("importsBox");
	*/
	window.openDialog(
			"chrome://semantic-turkey/content/metadata/change_prefix.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	/*
	 * }else{ alert("You cannot change this prefix, it's a prefix that belongs
	 * to the top ontology!"); }
	 */
};

art_semanticturkey.addImport = function() {
	var selectIndex = art_semanticturkey.getSelectedIndex();
	var selectLabel = art_semanticturkey.getSelectedLabel();
	if (selectIndex == 0) {
		alert("Please select a import type");
	} else {
		var parameters = new Object();
		parameters.parentWindow = window;
		parameters.selectedIndex = art_semanticturkey.getSelectedIndex();
		parameters.selectIndex = selectIndex;
		parameters.selectLabel = selectLabel;
		if (selectIndex == 4) {
			// NScarpato 03/03/2008 add import from mirror
			window
					.openDialog(
							"chrome://semantic-turkey/content/metadata/selectFileFromMirror.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							parameters);
		} else {
			window.openDialog(
					"chrome://semantic-turkey/content/metadata/addImport.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
		}
		// window.openDialog("chrome://semantic-turkey/content/fileChooser.xul","_blank","modal=yes,resizable,centerscreen",parameters);
	}
};

art_semanticturkey.downloadFromWebToMirror = function() {
	art_semanticturkey.downloadFailedImport('5','Download from Web to Mirror');
};
art_semanticturkey.downloadFromWeb = function() {
	art_semanticturkey.downloadFailedImport('6','Download from Web');
};
art_semanticturkey.getFromLocalFile = function() {
	art_semanticturkey.downloadFailedImport('7','Get from Local File');
};


art_semanticturkey.toggleSidebarFromImports = function(){
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
};



