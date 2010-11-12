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




window.onload = function() {
	art_semanticturkey.eventListenerArrayObject = new art_semanticturkey.eventListenerArrayClass();
	
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	if(projectIsNull == false){
		art_semanticturkey.populateClassTree();
	}else{
		art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("projectOpened", art_semanticturkey.populateClassTree, null);
	
	}
	art_semanticturkey.associateEventsOnGraphicElementsClasses();
	art_semanticturkey.associateEventsOnIndividualGraphicElements();
	art_semanticturkey.associatedragDropEventsOnGraphicElements();
	art_semanticturkey.associateOntologySearchEventsOnGraphicElements("clsNInd");
	
	
	art_semanticturkey.associateEventsFiredByServer();
	
};

window.onunload = function(){
	art_semanticturkey.eventListenerArrayObject.deregisterAllListener();
}



art_semanticturkey.populateClassTree = function() {
	document.getElementById("createRootClass").disabled = false;
	document.getElementById("createSubClass").disabled = false;
	document.getElementById("createSiblingClass").disabled = false;
	document.getElementById("removeClass").disabled = false;
	//document.getElementById("graph").disabled = false;
	try{
		
		var responseXML=art_semanticturkey.STRequests.Cls.getClassesInfoAsRootsForTree(true, "http://www.w3.org/2002/07/owl#Thing");
		art_semanticturkey.getClassesInfoAsRootsForTree_RESPONSE(responseXML);
	}catch (e) {
		alert(e.name + ": " + e.message);
	}
};

