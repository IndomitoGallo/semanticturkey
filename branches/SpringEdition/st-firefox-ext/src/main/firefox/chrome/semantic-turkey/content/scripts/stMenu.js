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


if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
if (!art_semanticturkey.ContexMenu) art_semanticturkey.ContexMenu = {};

Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);  // TODO va eliminato
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Administration.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_InputOutput.jsm",
		art_semanticturkey);

// NScarpato 18/07/07 add Visualization option function this function select the
// visualization type Normal o debug
art_semanticturkey.ContexMenu.manageOntologyMirror = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	
	window.openDialog(
			"chrome://semantic-turkey/content/metadata/mirror.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	
	/*window.open("chrome://semantic-turkey/content/mirror.xul", "showmore",
			"chrome, modal,resizable", parameters);*/
};


art_semanticturkey.ContexMenu.visualizationOptionNormal = function() {
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.setAdminLevel("off");
		art_semanticturkey.visualizationOptionNormal_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	return;
};

art_semanticturkey.visualizationOptionNormal_RESPONSE = function(responseElement){
	var visLevelInfo = new Object();
	visLevelInfo.visLevel= "normal";
	art_semanticturkey.evtMgr.fireEvent("visLevelChanged", visLevelInfo);
	//window.location.reload();
};

art_semanticturkey.ContexMenu.visualizationOptionDebug = function() {
	try{
		var responseXML = art_semanticturkey.STRequests.Administration.setAdminLevel("on");
		art_semanticturkey.visualizationOptionDebug_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	return;
};

art_semanticturkey.visualizationOptionDebug_RESPONSE = function() {
	var visLevelInfo = new Object();
	visLevelInfo.visLevel= "debug";
	art_semanticturkey.evtMgr.fireEvent("visLevelChanged", visLevelInfo);
	//window.location.reload();
};

art_semanticturkey.ContexMenu.exportRepository = function() {
	window.openDialog("chrome://semantic-turkey/content/inputOutput/exportRepository.xul",
			"_blank", "modal=yes,resizable,centerscreen");
};

art_semanticturkey.ContexMenu.loadRdf = function() {
	window.openDialog("chrome://semantic-turkey/content/inputOutput/loadRepository.xul",
			"_blank", "modal=yes,resizable,centerscreen");
	var rdfLoaded = new Object();
	art_semanticturkey.evtMgr.fireEvent("rdfLoaded", rdfLoaded);
	//window.location.reload();
};

art_semanticturkey.ContexMenu.clearRepository = function clearRepository() {
	//var risp = confirm("Clear Repository (Firefox will be restarted)");
	var risp = confirm("Clear Repository?");
	if (risp) {
		try{
			var responseXML = art_semanticturkey.STRequests.InputOutput.clearRepository();
			art_semanticturkey.clearRepository_RESPONSE(responseXML);
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

art_semanticturkey.clearRepository_RESPONSE = function(responseElement){
	if(responseElement.getElementsByTagName("reply")[0].getAttribute("status") == "ok"){
		var msg = responseElement.getElementsByTagName('msg')[0];
		alert(msg.getAttribute("content"));
		//var nsIAppStartup = Components.interfaces.nsIAppStartup;
		//Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(
		//		nsIAppStartup.eForceQuit | nsIAppStartup.eRestart);
		//art_semanticturkey.closeProject();
		//art_semanticturkey.manage_all_projects();
		
		//sends the event of clearData
		var clearedData = new Object();
		art_semanticturkey.evtMgr.fireEvent("clearedData", clearedData);
	}
};
