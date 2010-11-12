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

Components.utils.import("resource://stservices/SERVICE_SKOS.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

art_semanticturkey.eventsOntologyPanel = new function(){
	var arrayEvent = new Array();
	
	this.registerEvent = function(eventId, eventObj) {
		art_semanticturkey.evtMgr.registerForEvent(eventId, eventObj);
		if (arrayEvent[eventId] == undefined) {
			arrayEvent[eventId] = new Array;
		}
		arrayEvent[eventId].push(eventObj);
	};
	this.deregisterAllEvent = function(){
		for ( var id in arrayEvent) {			
			for(var i=0; i<arrayEvent[id].length; ++i){
				art_semanticturkey.evtMgr.deregisterForEvent(id, arrayEvent[id][i]);
			}
		}
	};
};

window.onload = function() {
	try {
			
		art_semanticturkey.associateEventsOnGraphicElementsConcepts();
		
		//register the handler for the events
		var st_ConceptSchemeSelectedObj = new art_semanticturkey.createSTConceptSchemeSelectedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptSchemeSelected", st_ConceptSchemeSelectedObj);

		//register the handler for the events
		var st_HumanReadableModeChangedObj = new art_semanticturkey.createSTHumanReadableModeChangedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("humanReadableModeChanged", st_HumanReadableModeChangedObj);

		//register the handler for the events
		var st_ConceptAddedObj = new art_semanticturkey.createSTConceptAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptAdded", st_ConceptAddedObj);

		//register the handler for the events
		var st_ConceptNarrowerAddedObj = new art_semanticturkey.createSTConceptNarrowerAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptNarrowerAdded", st_ConceptNarrowerAddedObj);

		//register the handler for the events
		var st_ConceptBroaderAddedObj = new art_semanticturkey.createSTConceptBroaderAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptBroaderAdded", st_ConceptBroaderAddedObj);

		//register the handler for the events
		var st_ConceptSchemeAddedObj = new art_semanticturkey.createSTConceptSchemeAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptSchemeAdded", st_ConceptSchemeAddedObj);

		//register the handler for the events from property editor
		var st_PropertyChangedObj = new art_semanticturkey.createSTPropertyChangedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("propertyChanged", st_PropertyChangedObj);
		var st_PropertyRemovedObj = new art_semanticturkey.createSTPropertyRemovedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("propertyRemoved", st_PropertyRemovedObj);
		var st_PropertyValueAddedObj = new art_semanticturkey.createSTPropertyValueAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("propertyValueAdded", st_PropertyValueAddedObj);
		
		
		// populate schema list
		art_semanticturkey.loadSchemeList(document.getElementById('skosSchemeMenupopup'));
		
		
		// init the human-readable mode...
		document.getElementById('toggleConceptLanguage').checked = art_semanticturkey.getHumanReadableMode();
				
	}catch (e){
		alert('errore: ' + e);
	}
};

window.onunload = function(){
	art_semanticturkey.eventsOntologyPanel.deregisterAllEvent();
};

art_semanticturkey.createSTPropertyRemovedObj = function(){
	this.eventHappened = function(eventId, obj) {	
		try {
			// reload conceptsTree
			art_semanticturkey.Logger.debug("event propertyRemoved fired!");
			var obj = new Object();
			obj.menuList = document.getElementById("skosSchemeMenuList");
			art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
			
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("propertyRemoved", this);
	};
};

art_semanticturkey.createSTPropertyValueAddedObj = function(){
	this.eventHappened = function(eventId, obj) {	
		try {
			// reload conceptsTree
			art_semanticturkey.Logger.debug("event propertyValueAdded fired!");
			var obj = new Object();
			obj.menuList = document.getElementById("skosSchemeMenuList");
			art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
			
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("propertyValueAdded", this);
	};
};

art_semanticturkey.createSTPropertyChangedObj = function(){
	this.eventHappened = function(eventId, obj) {	
		try {
			// reload conceptsTree
			art_semanticturkey.Logger.debug("event propertyChanged fired!");
			var obj = new Object();
			obj.menuList = document.getElementById("skosSchemeMenuList");
			art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
			
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptSchemeAdded", this);
	};
};
art_semanticturkey.createSTConceptSchemeAddedObj = function(){
	this.eventHappened = function(eventId, obj) {	
		try {
			// populate schema list
			art_semanticturkey.Logger.debug("event conceptSchemeAdded fired!");
			
			var menupopup = document.getElementById('skosSchemeMenupopup');
			var item = document.createElement("menuitem");
			item.setAttribute('name', obj.scheme.name);
			item.setAttribute('id', obj.scheme.uri);
			item.setAttribute('uri', obj.scheme.uri);
			if(art_semanticturkey.getHumanReadableMode() == true && obj.scheme.label.length > 0){
				item.setAttribute('label', obj.scheme.label);	
			} else {
				item.setAttribute('name', obj.scheme.uri);
			}
			menupopup.appendChild(item);						
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptSchemeAdded", this);
	};
};

art_semanticturkey.createSTConceptBroaderAddedObj = function(){
	this.eventHappened = function(eventId, obj) {
		try {
			var ml = document.getElementById("skosSchemeMenuList");
			if(obj.scheme == ml.selectedItem.id){
				if(ml.selectedIndex>0){
					// fire event conceptSchemeSelected
					var obj = new Object();
					obj.menuList = document.getElementById("skosSchemeMenuList");
					art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
				}						
			}
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptBroaderAdded", this);
	};
};

art_semanticturkey.createSTConceptNarrowerAddedObj = function(){
	this.eventHappened = function(eventId, obj) {
		try {
			art_semanticturkey.Logger.debug("event conceptNarrowerAdded fired!");
			
			var tree = document.getElementById("conceptsTree");
			var ti = tree.treeBoxObject.view.getItemAtIndex(tree.currentIndex);
			var tch = ti.getElementsByTagName('treechildren')[0];
		    var titem = document.createElement("treeitem");
		    var trow = document.createElement("treerow");
		    var tcell = document.createElement("treecell");
			var label = obj.newConcept.label;
			var name  = obj.newConcept.name;
			
		    if (ti.getAttribute("container") != "true") {
			      ti.setAttribute("container","true");
			      ti.setAttribute("open","true");
			      tch = document.createElement('treechildren');
			}
			// if human-readable mode... load label property otherwise load name property
			
			if(art_semanticturkey.getHumanReadableMode() == true && label.length > 0){
				tcell.setAttribute("label", label);
			}else {
				tcell.setAttribute("label",name);
			}			
			tcell.setAttribute("name", name);
			tcell.setAttribute("id", obj.newConcept.id);
			tcell.setAttribute("uri", obj.newConcept.uri);
			tcell.setAttribute("more", obj.newConcept.more);		
			
			trow.appendChild(tcell);
		    trow.appendChild(tcell);
		    titem.appendChild(trow);
		    tch.appendChild(titem);
		    ti.appendChild(tch);

		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptNarrowerAdded", this);
	};
};

art_semanticturkey.createSTConceptAddedObj = function(){
	this.eventHappened = function(eventId, obj) {
		try {
			var ml = document.getElementById("skosSchemeMenuList");
			if(obj.scheme == ml.selectedItem.id){
				if(ml.selectedIndex>0){
					// fire event conceptSchemeSelected
					var obj = new Object();
					obj.menuList = document.getElementById("skosSchemeMenuList");
					art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj);
				}						
			}
		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptAdded", this);
	};
};

art_semanticturkey.createSTHumanReadableModeChangedObj = function(){
	this.eventHappened = function(eventId, obj) {
		var obj2 = new Object();
		obj2.menuList = document.getElementById("skosSchemeMenuList");
		art_semanticturkey.evtMgr.fireEvent("conceptSchemeSelected", obj2);
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptSchemeSelected", this);
	};
};

art_semanticturkey.createSTConceptSchemeSelectedObj = function(){
	this.eventHappened = function(eventId, obj) {
		var skosSchemeMenuList = obj.menuList;
		if(skosSchemeMenuList.selectedIndex > 0 ) {		
			var selectedItem  = skosSchemeMenuList.selectedItem;
			var schemeUri = selectedItem.id;
			try{		
				// empty tree and load new data
				art_semanticturkey.clearConceptsTree();
				var responseXML = art_semanticturkey.STRequests.SKOS.getConceptsTree(schemeUri,art_semanticturkey.getDefaultLanguage());
				art_semanticturkey.skosSchemeMenupopupCommand_RESPONSE(responseXML);			
			}
			catch (e) {
				alert(e.name + ": " + e.message);
			}				
		}else {
			art_semanticturkey.clearConceptsTree();
		}
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptSchemeSelected", this);
	};
};

/**
 * Clear the concepts tree
 */
art_semanticturkey.clearConceptsTree = function () {
	var rootConceptsTreeChildren = document.getElementById('rootConceptsTreeChildren');
	while (rootConceptsTreeChildren.hasChildNodes()) {
		rootConceptsTreeChildren.removeChild(rootConceptsTreeChildren.lastChild);
	}
};

/**
 * Load narrower concept
 */
art_semanticturkey.loadNarroweConcepts = function(event,tree) {
	var action = "null";
	var tree = tree;
	if (typeof tree == 'undefined'){		
		tree = document.getElementById("conceptsTree");
	}
	var treeitem;
	if(event.type == "click"){
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

		
	}else{
		return
	}

	//do the requested action
	var treeChildren = treeitem.getElementsByTagName("treechildren")[0];
	if(action == "loadSubTree"){
		// EMPTY TREE, just to be extra sure
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
		var conceptName = treeitem.getAttribute("conceptName");
		var responseXML=art_semanticturkey.STRequests.SKOS.getNarrowerConcepts(conceptName,art_semanticturkey.getDefaultLanguage());
		
		art_semanticturkey.populateConceptTree(responseXML,treeChildren);
	}
	else if(action == "emptySubTree"){
		// EMPTY TREE
		while (treeChildren.hasChildNodes()) {
			treeChildren.removeChild(treeChildren.lastChild);
		}
	}
};