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

Components.utils.import("resource://stmodules/stEvtMgr.jsm");
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Property.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm", art_semanticturkey);


window.onload = function() {
	document.getElementById("addConceptRelationship").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.onClose, true);
	art_semanticturkey.associateEventsOnGraphicElementsConcepts();
	
	art_semanticturkey.setPanel();
	
	
};

/**
 * provide add listener for events related to graphic elements it is invokes 
 * by window.onload
 * @author Luca Mastrogiovanni <luca.mastrogiovanni@caspur.it> 
 */
art_semanticturkey.associateEventsOnGraphicElementsConcepts = function(){
	
	document.getElementById("skosConceptSchemeFromMenupopup").addEventListener("command", art_semanticturkey.skosConceptSchemeFromMenupopupCommand, true);
	document.getElementById("skosConceptSchemeToMenupopup").addEventListener("command", art_semanticturkey.skosConceptSchemeToMenupopupCommand, true);
	
	document.getElementById("conceptsTreeFrom").addEventListener("click", art_semanticturkey.conceptsTreeFromClick, true);
	document.getElementById("conceptsTreeTo").addEventListener("click", art_semanticturkey.conceptsTreeToClick, true);

};

art_semanticturkey.setPanel  = function() {
	
	// load the schemes list
	art_semanticturkey.loadSchemeList(document.getElementById('skosConceptSchemeFromMenupopup'));
	art_semanticturkey.loadSchemeList(document.getElementById('skosConceptSchemeToMenupopup'));
	
	try {
		var responseXML2 = art_semanticturkey.STRequests.Property.getObjPropertyTree();
		art_semanticturkey.getPropertiesTreePanel_RESPONSE(responseXML2);
	} catch (e) {
		alert(e);
	}
	

};


art_semanticturkey.skosConceptSchemeFromMenupopupCommand  = function() {
	var treeChildren = document.getElementById("rootConceptsTreeFromChildren");
	var obj = new Object();
	obj.menuList = document.getElementById("skosConceptSchemeFromList");
	if(obj.menuList.selectedIndex > 0 ) {		
		var selectedItem  = obj.menuList.selectedItem;
		var schemeUri = selectedItem.id;
		try{		
			// empty tree and load new data
			art_semanticturkey.clearTree(treeChildren);
			var responseXML = art_semanticturkey.STRequests.SKOS.getConceptsTree(schemeUri,art_semanticturkey.getDefaultLanguage());
			art_semanticturkey.populateTree(responseXML,treeChildren);			
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}				
	}else {
		art_semanticturkey.clearTree(treeChildren);
	}
};

art_semanticturkey.skosConceptSchemeToMenupopupCommand  = function() {
	var treeChildren = document.getElementById("rootConceptsTreeToChildren");
	var obj = new Object();
	obj.menuList = document.getElementById("skosConceptSchemeToList");
	if(obj.menuList.selectedIndex > 0 ) {		
		var selectedItem  = obj.menuList.selectedItem;
		var schemeUri = selectedItem.id;
		try{		
			// empty tree and load new data
			art_semanticturkey.clearTree(treeChildren);
			var responseXML = art_semanticturkey.STRequests.SKOS.getConceptsTree(schemeUri,art_semanticturkey.getDefaultLanguage());
			art_semanticturkey.populateTree(responseXML,treeChildren);
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}				
	}else {
		art_semanticturkey.clearTree(treeChildren);
	}
};
/**
 * load narrower concepts
 */
art_semanticturkey.conceptsTreeFromClick = function(event, tree, list) {
		
	var tree = document.getElementById("conceptsTreeFrom");
	if(typeof event != 'undefined'){
		var row = {};
		var col = {};
		var part = {};
		tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
		var isTwisty = (part.value == "twisty");		
		if(isTwisty == false){
			return;
		}
		
		var row = tree.treeBoxObject.getRowAt(event.clientX, event.clientY);
		var item = tree.contentView.getItemAtIndex(row);
		art_semanticturkey.loadNarrower(event,item);
	}
};

/**
 * load narrower concepts
 */
art_semanticturkey.conceptsTreeToClick = function(event, tree, list) {
	var tree = document.getElementById("conceptsTreeTo");
	if(typeof event != 'undefined'){
		var row = {};
		var col = {};
		var part = {};
		tree.treeBoxObject.getCellAt(event.clientX, event.clientY, row, col, part);
		var isTwisty = (part.value == "twisty");		
		if(isTwisty == false){
			return;
		}
		
		var row = tree.treeBoxObject.getRowAt(event.clientX, event.clientY);
		var item = tree.contentView.getItemAtIndex(row);
		art_semanticturkey.loadNarrower(event,item);
	}
};
art_semanticturkey.onAccept = function() {
	var treeFrom =document.getElementById("conceptsTreeFrom"); 
	var treeTo =document.getElementById("conceptsTreeTo");
	var treeProperty =document.getElementById("propertiesTreePanel");
	
	art_semanticturkey.Logger.debug("from current index: " + treeFrom.currentIndex);
	if(treeFrom.currentIndex > -1 && treeTo.currentIndex > -1 && 
			treeProperty.currentIndex > -1){
			
		var currentelementFrom = treeFrom.treeBoxObject.view.getItemAtIndex(treeFrom.currentIndex);
		var treerowFrom = currentelementFrom.getElementsByTagName('treerow')[0];
		var treecellFrom = treerowFrom.getElementsByTagName('treecell')[0];
		var conceptFrom = treecellFrom.getAttribute("uri"); 
		
		var currentelementTo = treeTo.treeBoxObject.view.getItemAtIndex(treeTo.currentIndex);
		var treerowTo = currentelementTo.getElementsByTagName('treerow')[0];
		var treecellTo = treerowTo.getElementsByTagName('treecell')[0];
		var conceptTo = treecellTo.getAttribute("uri");
		
		var currentelementProperty = treeProperty.treeBoxObject.view.getItemAtIndex(treeProperty.currentIndex);
		var treerowProperty = currentelementProperty.getElementsByTagName('treerow')[0];
		var treecellProperty = treerowProperty.getElementsByTagName('treecell')[0];
		var conceptProperty = treecellProperty.getAttribute("label");
		
		alert(conceptFrom + ' | ' + conceptProperty + ' |'  + conceptTo );
		
		var responseXML = art_semanticturkey.STRequests.SKOS.addSemanticRelation(conceptFrom, conceptProperty, conceptTo);
		
	} else {
		if(treeFrom.currentIndex == -1 || treeTo.currentIndex == -1)
			alert('Please, select a concept!','warning');
		else if(treeProperty.currentIndex == -1)
			alert('Please, select a valid semantic relation!','warning');
	}

};

art_semanticturkey.onClose = function() {
	
	close();
		
};


art_semanticturkey.getPropertiesTreePanel_RESPONSE = function(responseElement) {
	var node = document.getElementById('rootPropertyTreePanelChildren');
	var dataElement = responseElement.getElementsByTagName('data')[0];
	var propertyList = dataElement.childNodes;
	for ( var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			if(propertyList[i].getAttribute("name") == 'skos:semanticRelation'){
				art_semanticturkey.parsingProperties(propertyList[i], node, true);	
			}			
		}
	}
};
art_semanticturkey.parsingProperties = function(propertyNode, node, isRootNode) {
	var name = propertyNode.getAttribute("name");
	var deleteForbidden = propertyNode.getAttribute("deleteForbidden");
	var type = propertyNode.getAttribute("type");
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	tc.setAttribute("label", name);
	tc.setAttribute("deleteForbidden", deleteForbidden);
	tc.setAttribute("propType", type);
	// NScarpato 25/06/2007 remove owl: because : doesn't work for css
	type = type.substring(4);
	if (deleteForbidden == "true")
		type = type + "_noexpl";
	tr.setAttribute("properties", type);
	tc.setAttribute("properties", type);
	tc.setAttribute("isRootNode", isRootNode);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.setAttribute("propertyName", name); 
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var propertiesNodes;
	var propertiesList = propertyNode.childNodes;
	for ( var i = 0; i < propertiesList.length; i++) {
		if (propertiesList[i].nodeName == "SubProperties") {
			propertiesNodes = propertiesList[i].childNodes;
			for ( var j = 0; j < propertiesNodes.length; j++) {
				if (propertiesNodes[j].nodeType == 1) {
					art_semanticturkey.parsingProperties(propertiesNodes[j],
							tch, false);
				}
			}
		}
		if (propertiesNodes != null && propertiesNodes.length > 0) {
			ti.setAttribute("open", true);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}
	}
};