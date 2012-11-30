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
	Components.utils.import("resource://stservices/SERVICE_Individual.jsm",
			art_semanticturkey);
	Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

	//netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	
window.onload = function() {

	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
	.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
	.getService(Components.interfaces.nsISemanticTurkeyAnnotation);

	//add the eventlistener for the buttons
	document.getElementById("Ok").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("Cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);
	    		
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	
	//get the functions for the selected family for the event drag'n'drop over instance
	var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("dragDropOverSkosConcept");
	
	//get the groupbox
	var groupbox = document.getElementById("group");
	
	for(var i=0; i<FunctionOI.length; i++)
	{
		//if function is enabled show it else skip
		if(FunctionOI[i].isEnabled()) {
			var radiobox = document.createElement("radio");
			radiobox.setAttribute("id",i);
			radiobox.setAttribute("label",FunctionOI[i].getdescription());
			groupbox.appendChild(radiobox);
		}
	}
	       
};  

//actions performed by Ok button
art_semanticturkey.onAccept = function() {
	
	var sitem = document.getElementById("group").selectedItem;
	//get the id of the item selected: used it to address the function
	var sindex = sitem.getAttribute("id");
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
			.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
			.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	
	var event = window.arguments[0].event;
	var parentWindow = window.arguments[0].parentWindow;
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	
	if (AnnotFunctionList[defaultAnnotFun] != null) {
		//get the functions for the event drag'n'drop over instance
		var FunctionOI = AnnotFunctionList[defaultAnnotFun].getfunctions("dragDropOverSkosConcept");
		//set timeout to close the window
		//window.setTimeout(function() {window.close();}, 100);
		
		//execute the selected function
		var fun = FunctionOI[sindex].getfunct();
		fun(event,parentWindow);
	} else {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, defaultAnnotFun
				+ " annotation type not registered ", defaultAnnotFun
				+ " not registered annotation type reset to bookmarking");
		prefs.setCharPref("extensions.semturkey.extpt.annotate", "bookmarking");
	}
	close();
};

//when cancel button is pressed close the window
art_semanticturkey.onCancel = function() {
	close();
};