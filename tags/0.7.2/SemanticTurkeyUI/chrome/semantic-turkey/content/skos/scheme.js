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
		var list = document.getElementById("SchemesList");
		
		art_semanticturkey.associateEventsOnGraphicElementsConcepts();
		
		// load schemes...		
		var responseXML = art_semanticturkey.STRequests.SKOS.getAllSchemesList(art_semanticturkey.getDefaultLanguage());
		art_semanticturkey.getAllSchemesList_RESPONSE(responseXML,list);
		
		//register the handler for the events
		var st_HumanReadableModeChangedObj = new art_semanticturkey.createSTHumanReadableModeChangedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("humanReadableModeChanged", st_HumanReadableModeChangedObj);
		
		//register the handler for the events
		var st_ConceptSchemeAddedObj = new art_semanticturkey.createSTConceptSchemeAddedObj();
		art_semanticturkey.eventsOntologyPanel.registerEvent("conceptSchemeAdded", st_ConceptSchemeAddedObj);

		// init the human-readable mode...
		document.getElementById('toggleConceptLanguage').checked = art_semanticturkey.getHumanReadableMode();
		
	}catch (e){
		alert('errore: ' + e);
	}
};

window.onunload = function(){
	art_semanticturkey.eventsOntologyPanel.deregisterAllEvent();
};

art_semanticturkey.createSTHumanReadableModeChangedObj = function(){
	this.eventHappened = function(eventId, obj) {
		art_semanticturkey.Logger.debug("event humanReadableModeChanged fired!");
		// load schemes...	
		var list = document.getElementById("SchemesList");
	    while(list.getRowCount() != 0) {
	    	list.removeItemAt(0);
	    }
		var responseXML = art_semanticturkey.STRequests.SKOS.getAllSchemesList(art_semanticturkey.getDefaultLanguage());
		art_semanticturkey.getAllSchemesList_RESPONSE(responseXML,list);
	};

	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("humanReadableModeChanged", this);
	};
};

art_semanticturkey.createSTConceptSchemeAddedObj = function(){
	this.eventHappened = function(eventId, obj) {	
		try {
		    var listBox = document.getElementById("SchemesList");
		    while(listBox.getRowCount() != 0) {
		        listBox.removeItemAt(0);
		    }
			// load schemes...		
			var responseXML = art_semanticturkey.STRequests.SKOS.getAllSchemesList(art_semanticturkey.getDefaultLanguage());
			art_semanticturkey.getAllSchemesList_RESPONSE(responseXML,listBox);

		}catch (e){
			art_semanticturkey.Logger.debug(e);	
		}		
	};
	this.unregister = function() {
		art_semanticturkey.evtMgr.deregisterForEvent("conceptSchemeAdded", this);
	};
};

art_semanticturkey.associateEventsOnGraphicElementsConcepts = function(){
	// Tool bar buttons
	document.getElementById("addScheme").addEventListener("command", art_semanticturkey.addScheme, true);
	document.getElementById("toggleConceptLanguage").addEventListener("command", art_semanticturkey.toggleConceptLanguage, true);
};


art_semanticturkey.addScheme = function (event) {
	var list = document.getElementById("SchemesList");
	var parameters = new Object();
	parameters.type = "schemesList";
	parameters.parentWindow = window;
	window.openDialog("chrome://semantic-turkey/content/skos/createScheme/createScheme.xul", "_blank", "modal=yes,resizable,centerscreen", parameters);
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

art_semanticturkey.getAllSchemesList_RESPONSE = function(responseXML, list) {
	var responseList = responseXML.getElementsByTagName('Scheme');
	for (var i = 0; i < responseList.length; i++) {
		var schemeName = responseList[i].getAttribute("name");
		var schemeUri = responseList[i].getAttribute("uri");
		var schemeLabel = responseList[i].getAttribute("label");
		var label = "";
		var lsti = document.createElement("listitem");
		lsti.setAttribute("name",schemeName);
		lsti.setAttribute("schemeUri",schemeUri);
		// if human-readable mode... load label property otherwise load name property
		if(art_semanticturkey.getHumanReadableMode() == true && schemeLabel.length > 0){
			label = schemeLabel;
		}else {
			label = schemeUri;
		}
		lsti.setAttribute("label", label);
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		img.setAttribute("src","chrome://semantic-turkey/content/images/skosConcept20x20.png");
		
		var lbl = document.createElement("label");
		lbl.setAttribute("value", label);
		lbl.setAttribute("id", schemeUri);
		lci.appendChild(img);
		lci.appendChild(lbl);		
		lsti.appendChild(lci);
		list.appendChild(lsti);
	}
};

