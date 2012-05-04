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

	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefBranch);
	var defaultAnnotFun = prefs
	.getCharPref("extensions.semturkey.extpt.annotate");
	var annComponent = Components.classes["@art.uniroma2.it/semanticturkeyannotation;1"]
	.getService(Components.interfaces.nsISemanticTurkeyAnnotation);
	
window.onload = function() { 
	
	//register the eventlistener for buttons
	document.getElementById("ok").addEventListener("click",
			art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);

	//set the title of window and get family and function of that family
	var family=window.arguments[0].label;
	var title = document.getElementById("options2");
	title.setAttribute("title", family);
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	var eventList=AnnotFunctionList[family].getArrayEventFunctions();
	var listbox = document.getElementById("Events");

	//for each event, create the listbox of function for that event
	for (var eventName in eventList) {  
		var annListItem = document.createElement("listitem");
		annListItem.setAttribute("label", eventName);
		annListItem.addEventListener("click",art_semanticturkey.choiceFunction, true);
		listbox.appendChild(annListItem);
		
		var FunctionOI = AnnotFunctionList[family].getfunctions(eventName);
		
		var listbox1 = document.getElementById(eventName);
		
		//each funtion is presented as a checkbox
		for(var i=0; i<FunctionOI.length; i++)
		{
			var checkbox = document.createElement("listitem");
			checkbox.setAttribute("type","checkbox");
			checkbox.setAttribute("id",i);
			checkbox.setAttribute("label",FunctionOI[i].getdescription());
			//if function is enabled the checkbox is set
			if(FunctionOI[i].isEnabled()){
				checkbox.setAttribute("checked",true);}
			listbox1.appendChild(checkbox);
		}	
	}
}; 

//function that switch the listbox of function depend the selected event
art_semanticturkey.choiceFunction = function() {
		
	var list = document.getElementById("Events");
	var selectedItem = list.selectedItem;
	//set always the fake listbox(empty) to hidden=true
	var fake = document.getElementById("fake");
	fake.setAttribute("hidden",true);
	var eventLabel = selectedItem.getAttribute("label");
	var listbox = document.getElementById(eventLabel);
	
	//set all the listbox hidden
	for(var i=0; i<list.getRowCount(); i++) {
		var app = list.getItemAtIndex(i);
		var x = document.getElementById(app.getAttribute("label"));
		x.setAttribute("hidden", "true");
	}
	//show only selected listbox
	listbox.setAttribute("hidden","false");
	
};

//action performed when Ok button is clicked
art_semanticturkey.onAccept = function() {
	
	var family=window.arguments[0].label;
	var AnnotFunctionList = annComponent.wrappedJSObject.getList();
	var eventList=AnnotFunctionList[family].getArrayEventFunctions();
	
	//for each event check the relative listbox of function
	for (var eventName in eventList) {  
		var listbox=document.getElementById(eventName);
		listbox.setAttribute("hidden", "false");
		var FunctionOI = AnnotFunctionList[family].getfunctions(eventName);
		//for each function if box is checked function is enabled, else it is disabled
		for(var i=0; i<listbox.getRowCount(); i++) {
			var app = listbox.getItemAtIndex(i);
			if(app.hasAttribute("checked"))
					FunctionOI[i].enable();
			else
				FunctionOI[i].disable();
		}
		listbox.setAttribute("hidden", "true");
	}
	close();
};

//if Cancel is clicked, window is closed without modify the functions
art_semanticturkey.onCancel = function() {
	close();
};