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
const langsPrefsEntry = "extensions.semturkey.annotprops.langs";
const defaultLangsPrefsEntry = "extensions.semturkey.annotprops.defaultlang";

if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("insertBaseuri").addEventListener("click",
			art_semanticturkey.onAccept, true);
	
	document.getElementById("baseUriTxtBox").addEventListener("command",
			art_semanticturkey.onAccept, true);
	
	if(window.arguments[0].canBeClosed == false){
		document.getElementById("cancel").hidden = true;
	}
	else{
		document.getElementById("cancel").addEventListener("click",
				art_semanticturkey.onCancel, true);
	}
	document.getElementById("baseUriTxtBox").focus();
			
	//if ("arguments" in window && window.arguments[0] instanceof Components.interfaces.nsIDialogParamBlock) {
		/*var baseuri_state = window.arguments[0].GetString(0);
		var repImpl_state = window.arguments[0].GetString(1);
		var baseuri = window.arguments[0].GetString(2);
		var repositoryImplementation = window.arguments[0].GetString(3);*/
	var baseuri_state = window.arguments[0].baseuri_state;
	var repImpl_state = window.arguments[0].repImpl_state;
	var baseuri = window.arguments[0].baseuri;
	var repositoryImplementation = window.arguments[0].repositoryImplementation;
	//}
	if (baseuri_state != "unavailable") {
		document.getElementById('baseUriTxtBox').setAttribute("value", baseuri);
	}
	try{
		var responseXML = art_semanticturkey.STRequests.SystemStart.listOntManagers();
		art_semanticturkey.populateInitializePanel_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	if (repImpl_state != "unavailable") {
		repBTN = document.getElementById(repositoryImplementation);
		repBTN.setAttribute("selected", "true");
	}	
};



/**
 * @author Noemi Scarpato
 * @param xmlResponseContent
 * @return
 */
art_semanticturkey.populateInitializePanel_RESPONSE = function(xmlResponseContent) {
	var repList = xmlResponseContent.getElementsByTagName('Repository');
	var radiogroup = document.getElementById("repositoryList");
	for ( var i = 0; i < repList.length; i++) {
		var repositoryName = repList[i].getAttribute("repName");
		var repBTN = document.createElement("radio");
		repBTN.setAttribute("id", repositoryName);
		repBTN.setAttribute("label", repositoryName);
		radiogroup.appendChild(repBTN);
	}
};



/**
 * @author NScarpato 15/04/2008 select baseUri and default Namespace for working
 *         ontolgy
 */
art_semanticturkey.onAccept = function() {
	var baseuri = document.getElementById("baseUriTxtBox").value;
	if ( art_semanticturkey.stringEndsWith(baseuri, "#") ) {
		var len = baseuri.length - 1;
		var val = baseuri.substring(0, len);
		art_semanticturkey.Logger.debug("dentro OnAccept value" + val);
	}
	var repositoryImplementation;
	if (document.getElementById("repositoryList").selectedItem != null)
		repositoryImplementation = document.getElementById("repositoryList").selectedItem.label;
	else 
		repositoryImplementation = "unavailable";
	if (repositoryImplementation != "unavailable" && art_semanticturkey.isUrl(baseuri)) {	
		try{
			art_semanticturkey.STRequests.SystemStart.start(baseuri,repositoryImplementation);
			art_semanticturkey.CurrentProject.setCurrentProjet("Main Project", false, "continuosEditing");
			art_semanticturkey.projectOpened("Main Project");
		}
		catch (e) {
			alert(e.name + ": " + e.message);
		}
		art_semanticturkey.properClose();
		//close();
	} else if(repositoryImplementation == "unavailable"){
		alert("please select a repository from the list");
	} else {
		alert("please type a valid URI and select a repository \n An example of valid URI is: http://myontology");	
	}
};

/** 
 * @author NScarpato 15/04/2008 onCancel
 */
art_semanticturkey.onCancel = function() {
	art_semanticturkey.properClose();
};

art_semanticturkey.properClose = function(){
	window.arguments[0].properClose = true;
	close();
};
