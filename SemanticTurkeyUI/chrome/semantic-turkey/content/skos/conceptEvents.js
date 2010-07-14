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
 * provide add listener for events related to graphic elements it is invokes 
 * by window.onload in main script concept.js
 * @author Luca Mastrogiovanni <luca.mastrogiovanni@caspur.it> 
 */
art_semanticturkey.associateEventsOnGraphicElementsConcepts = function(){
	document.getElementById("skosSchemeMenupopup").addEventListener("command", art_semanticturkey.skosSchemeMenupopupCommand, true);
	document.getElementById("conceptsTree").addEventListener("dblclick", art_semanticturkey.conceptsTreedoubleClick, true);
	document.getElementById("conceptsTree").addEventListener("click", art_semanticturkey.conceptsTreeClick, true);

	// Tool bar buttons
	document.getElementById("addConcept").addEventListener("command", art_semanticturkey.addConcept, true);
	document.getElementById("toggleConceptLanguage").addEventListener("command", art_semanticturkey.toggleConceptLanguage, true);
	
	// Clipmenu events
	document.getElementById("menuItemCreateNarrowerConcept").addEventListener("command", art_semanticturkey.createNarrowerConcept, true);
	document.getElementById("menuItemCreateBroaderConcept").addEventListener("command", art_semanticturkey.createBroaderConcept, true);
	document.getElementById("menuItemDeleteConcept").addEventListener("command", art_semanticturkey.deleteConcept, true);
	
};
art_semanticturkey.deleteConcept = function(event) {
	alert('art_semanticturkey.deleteConcept');
};

art_semanticturkey.createNarrowerConcept = function(event) {
	var tree = document.getElementById("conceptsTree");	
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Concept");
		return;
	}
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var ml = document.getElementById("skosSchemeMenuList");

	var parameters = new Object();
	parameters.type = "narrower";
	parameters.parentWindow = window;
	parameters.scheme = ml.selectedItem.id;
	parameters.relatedConcept = treecell.getAttribute("uri");
	parameters.treerow = treerow;
	parameters.conceptLabel = treecell.getAttribute("label");
	window.openDialog("chrome://semantic-turkey/content/skos/createRelation/createRelation.xul", "_blank", "modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.createBroaderConcept = function(event) {
	var tree = document.getElementById("conceptsTree");	
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Concept");
		return;
	}
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var ml = document.getElementById("skosSchemeMenuList");

	var parameters = new Object();
	parameters.type = "broader";
	parameters.parentWindow = window;
	parameters.scheme = ml.selectedItem.id;
	parameters.relatedConcept = treecell.getAttribute("uri");
	parameters.treerow = treerow;
	parameters.conceptLabel = treecell.getAttribute("label");
	window.openDialog("chrome://semantic-turkey/content/skos/createRelation/createRelation.xul", "_blank", "modal=yes,resizable,centerscreen", parameters);

};

/**
 * Change the Human-Readable mode and fire the event
 * @author Luca Mastrogiovanni
 */
art_semanticturkey.toggleConceptLanguage = function (event) {
	art_semanticturkey.setHumanReadableMode(!art_semanticturkey.getHumanReadableMode());
	var obj = new Object();
	obj.menuList = document.getElementById("skosSchemeMenuList");
	art_semanticturkey.evtMgr.fireEvent("humanReadableModeChanged", obj);	
};

/**
 * @author Luca Mastrogiovanni invoke create new concept
 */
art_semanticturkey.addConcept = function(event) {
	var tree = document.getElementById("conceptsTree");
	var parameters = new Object();
	parameters.type = "conceptsTree";
	parameters.parentWindow = window;
	window.openDialog("chrome://semantic-turkey/content/skos/addConcept/addConcept.xul", "_blank", "modal=yes,resizable,centerscreen", parameters);
};

/**
 * fire event conceptSchemeSelected
 */
art_semanticturkey.skosSchemeMenupopupCommand = function() {
	var obj = new Object();
	obj.menuList = document.getElementById("skosSchemeMenuList");
	art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
};

/**
 * show editorPanel
 */
art_semanticturkey.conceptsTreedoubleClick = function(event) {
	var tree = document.getElementById("conceptsTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		return;
	}
	var currentelement = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
	tree.treeBoxObject.view.toggleOpenState(tree.currentIndex);
	var treerow = currentelement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	
	var uri = treecell.getAttribute("uri");
	var name = treecell.getAttribute("name");
	var parameters = new Object();
	parameters.sourceType = "skosConcept";
	parameters.sourceElement = treecell;
	parameters.sourceElementName = name;
	parameters.parentWindow = window;
	parameters.tree = tree;
	parameters.isFirstEditor = true;
	window.openDialog("chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);		
};

/**
 * load narrower concepts
 */
art_semanticturkey.conceptsTreeClick = function(event, tree, list) {
	if(typeof event != 'undefined'){
		art_semanticturkey.loadNarroweConcepts(event,tree);
	}
};

/**
 * manage the response and populate the conceptTree
 */
art_semanticturkey.skosSchemeMenupopupCommand_RESPONSE = function(responseXML) {
	var rootConceptsTreeChildren = document.getElementById('rootConceptsTreeChildren');	
	art_semanticturkey.populateConceptTree(responseXML,rootConceptsTreeChildren);
};


art_semanticturkey.populateConceptTree = function(responseXML,rootNode) {
	var dataElement = responseXML.getElementsByTagName('data')[0];
	var conceptList = dataElement.getElementsByTagName("concept");
	var i = 0;
	for(i=0; i<conceptList.length;i++){
		var conceptNode = conceptList[i];
		var tr = document.createElement("treerow");
		var tc = document.createElement("treecell");
		var label = conceptNode.getAttribute("label");
		var name  = conceptNode.getAttribute("name");

		// if human-readable mode... load label property otherwise load name property
		if(art_semanticturkey.getHumanReadableMode() == true && label.length > 0){
			tc.setAttribute("label", label);
		}else {
			tc.setAttribute("label",name);
		}			
		tc.setAttribute("name", name);
		tc.setAttribute("id", conceptNode.getAttribute("id"));
		tc.setAttribute("uri", conceptNode.getAttribute("uri"));
		tc.setAttribute("more", conceptNode.getAttribute("more"));		
		tr.appendChild(tc);
		
		var ti = document.createElement("treeitem");
		ti.setAttribute("conceptName", conceptNode.getAttribute("name"));
		ti.appendChild(tr);
		
		var tch = document.createElement("treechildren");
		rootNode.appendChild(ti);
		var more = conceptNode.getAttribute("more");
		if (more == "1") {
			ti.appendChild(tch);
			ti.setAttribute("container", true);
			ti.setAttribute("open", false);
		} else {
			ti.setAttribute("container", false);
		}
	}	
};
