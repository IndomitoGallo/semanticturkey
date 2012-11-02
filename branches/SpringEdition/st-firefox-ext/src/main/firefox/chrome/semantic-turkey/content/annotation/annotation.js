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

/*************************************************************************************************************
 * 
 * this file contains functions related to the "highlighter", that is the two events: 1) when a page is open,
 * if it contains annotations, then the highlighter is shown 2) when the user clicks on the highlighter,
 * annotations are shown on the page
 * 
 */

if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);


/**
 * this function checks if "annotation checking" is enabled, and in affirmative case, checks it there are
 * annotations if there are annotations available in the page
 * 
 * @param event
 * 
 * @return
 */
art_semanticturkey.chkAnnotation = function(event) {
	var projectIsNull = art_semanticturkey.CurrentProject.isNull();
	var chkAnn = art_semanticturkey.Preferences.get("extensions.semturkey.annotation.checkAnnotation", true);
	if (projectIsNull == false && chkAnn == true) {
		var doc = gBrowser.contentDocument;
		var list = doc.getElementsByTagName("div");

		art_semanticturkey.Logger.debug("doc: " + gBrowser.selectedBrowser.currentURI.spec);
		art_semanticturkey.Logger.debug("list: " + list.length);

		var url = gBrowser.selectedBrowser.currentURI.spec;
		try {
			var responseXML = art_semanticturkey.STRequests.Annotation.chkAnnotation(url);
			art_semanticturkey.chkAnnotation_RESPONSE(responseXML);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};


art_semanticturkey.chkAnnotation_RESPONSE = function(responseElement) {
	var reply = responseElement.getElementsByTagName('reply')[0];
	var act = reply.getAttribute("status");
	art_semanticturkey.active(act);
};

art_semanticturkey.active = function(act) {
	var statusIcon = document.getElementById("status-bar-annotation");
	if (act == "ok") {
		statusIcon.collapsed = false;
	} else {
		statusIcon.collapsed = true;
	}
};

art_semanticturkey.viewAnnotationOnPage = function() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");
		var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
		AnnotFunctionList=annComponent.wrappedJSObject.getList();
		
		if (AnnotFunctionList[defaultAnnotFun] != null) {
			//get the function of the selected family for the event highlight function
			var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("highlightAnnotation");
			var count=0;
			var index;
			
			//check how much function are present and enabled
			for(var j=0; j<FunctionOI.length;j++)
				if(FunctionOI[j].isEnabled()){
					count++;
					index=j;
				}
			
			//if no functions alert the user
			if(count == 0)
				alert("Non ci sono funzioni registrate o abilitate per questo evento");
			//if 1 function is present and enabled execute
			else if (count == 1) {
				var fun = FunctionOI[index].getfunct();
				fun();
			}
			//open the choice menu
			else {
				
				window.openDialog(
						"chrome://semantic-turkey/content/DragDrop/highlightFunction.xul",
						"_blank", "modal=yes,resizable,centerscreen");
			}
				
		}
		else {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
			prompts.alert(null,defaultAnnotFun+" annotation type not registered ",defaultAnnotFun+" not registered annotation type reset to bookmarking");
			prefs.setCharPref("extensions.semturkey.extpt.annotate","bookmarking");
		}
		
};

// Adding an event for the changing of a tab
gBrowser.tabContainer.addEventListener("TabSelect", art_semanticturkey.chkAnnotation, false);

// adding an event for loading of the loading of the page in a tab of the browser
gBrowser.addEventListener("load", art_semanticturkey.chkAnnotation, true);

//TODO check this error
//adding an event for the loading of a project // FF 4.0 says: Error: art_semanticturkey.eventListener is not a constructor Sourcefile: chrome://semantic-turkey/content/annotation/annotation.js Row: 100
//art_semanticturkey.eventListenerForAnnotationObject = new art_semanticturkey.eventListener("projectOpened", art_semanticturkey.chkAnnotation, null);
//just guessing based on: http://www.quirksmode.org/js/events_advanced.html

//art_semanticturkey.eventListenerForAnnotationObject = new art_semanticturkey.eventListener("projectOpened", art_semanticturkey.chkAnnotation, null);

