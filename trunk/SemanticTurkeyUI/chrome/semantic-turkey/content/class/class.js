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
Components.utils.import("resource://stservices/SERVICE_Cls.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Individual.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Synonyms.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_OntoSearch.jsm", 
		art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);

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
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == false){
		art_semanticturkey.populateClassTree();
	}else{
		var st_startedobj = new art_semanticturkey.createSTStartedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("projectOpened",st_startedobj);
	}
	art_semanticturkey.associateEventsOnGraphicElementsClasses();
	art_semanticturkey.associateEventsOnIndividualGraphicElements();
	art_semanticturkey.associatedragDropEventsOnGraphicElements();
	art_semanticturkey.associateOntologySearchEventsOnGraphicElements("clsNInd");
	
	//register the handler for the events
	var st_visLevelObj = new art_semanticturkey.createSTVisualizationLevelObj();
	art_semanticturkey.eventsOntologyPanel.registerEvent("visLevelChanged", st_visLevelObj);
	
	var st_closedProjectObj = new art_semanticturkey.createSTClosedProjectObj();
	art_semanticturkey.eventsOntologyPanel.registerEvent("projectClosed", st_closedProjectObj);
	
	var st_rdfLoadedObj = new art_semanticturkey.rdfLoadedObj();
	art_semanticturkey.eventsOntologyPanel.registerEvent("rdfLoaded", st_rdfLoadedObj);
	
	var st_clearedDataObj = new art_semanticturkey.clearedDataObj();
	art_semanticturkey.eventsOntologyPanel.registerEvent("clearedData", st_clearedDataObj);
	
};

window.onunload = function(){
	art_semanticturkey.eventsOntologyPanel.deregisterAllEvent();
}

/**
 * initializecreateClassEvents
 */
art_semanticturkey.initializeEvents = function() {
	var treeobj = new art_semanticturkey.createTreeObj();
	art_semanticturkey.evtMgr.registerForEvent("classAdded", treeobj);
	art_semanticturkey.evtMgr.registerForEvent("removeClass", treeobj);
	art_semanticturkey.evtMgr.registerForEvent("addInstance", treeobj);
	art_semanticturkey.evtMgr.registerForEvent("removeInstance", treeobj);
};

art_semanticturkey.createTreeObj = function() {
	this.fireEvent = function(eventId, classAddedObj) {
		classAddedObj.createCls();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("classAdded", this);
	};
};

art_semanticturkey.createSTStartedObj = function() {
	this.fireEvent = function(eventId, st_startedobj) {
		art_semanticturkey.populateClassTree();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("st_started", this);
	};
};


art_semanticturkey.populateClassTree = function() {
	document.getElementById("createRootClass").disabled = false;
	document.getElementById("createSubClass").disabled = false;
	document.getElementById("createSiblingClass").disabled = false;
	document.getElementById("removeClass").disabled = false;
	//document.getElementById("graph").disabled = false;
	try{
		
		//var responseXML = art_semanticturkey.STRequests.Cls.getClassTree();
		//var responseXML=art_semanticturkey.STRequests.Cls.getSubClasses("owl:Thing",true,true);
		//art_semanticturkey.getSubClassesTree_RESPONSE(responseXML);
		var responseXML=art_semanticturkey.STRequests.Cls.getClassesInfoAsRootsForTree(true, "http://www.w3.org/2002/07/owl#Thing");
		art_semanticturkey.getClassesInfoAsRootsForTree_RESPONSE(responseXML);
	}catch (e) {
		alert(e.name + ": " + e.message);
	}
};



art_semanticturkey.createSTClosedProjectObj = function() {
	this.fireEvent = function(eventId, closedProjectInfo) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
    };

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("projectClosed", this);
	};
};


art_semanticturkey.createSTVisualizationLevelObj = function(){
	this.fireEvent = function(eventId, visualizationLevel) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("visLevelChanged", this);
	};
};

art_semanticturkey.rdfLoadedObj = function(){
	this.fireEvent = function(eventId, rdfLoaded) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow); 
        mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("rdfLoaded", this);
	};
};

art_semanticturkey.clearedDataObj = function(){
	this.fireEvent = function(eventId, clearedData) {
		var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIWebNavigation)
               .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
               .rootTreeItem
               .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
               .getInterface(Components.interfaces.nsIDOMWindow); 
    	mainWindow.toggleSidebar();
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("clearedData", this);
	};
};