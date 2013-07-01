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

Components.utils.import("resource://stservices/SERVICE_Individual.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/AnnotationManager.jsm", art_semanticturkey);

// netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);
var defaultAnnotFun = prefs.getCharPref("extensions.semturkey.extpt.annotate");

art_semanticturkey.init = function() {
	// register the eventlistener for buttons
	document.getElementById("acceptButton").addEventListener("command", function() {
		document.documentElement.acceptDialog();
	}, false);
	document.getElementById("cancelButton").addEventListener("command", function() {
		document.documentElement.cancelDialog();
	}, false);

	document.addEventListener("dialogaccept", art_semanticturkey.onAccept, false);

	var familyId = window.arguments[0].annotationFamilyId;
	var families = art_semanticturkey.annotation.AnnotationManager.getFamilies();
	var family = families[familyId];

	// set the title of window and get family and function of that family
	var title = document.getElementById("options2");
	title.setAttribute("title", family.getName());

	var eventHandlerMap = family.getEventHandlerMap();
	var listbox = document.getElementById("Events");

	// for each event, create the listbox of function for that event
	for ( var eventName in eventHandlerMap) {
		var annListItem = document.createElement("listitem");
		annListItem.setAttribute("label", eventName);
		annListItem.addEventListener("click", art_semanticturkey.choiceFunction, true);
		listbox.appendChild(annListItem);

		var handlers = eventHandlerMap[eventName]

		var listbox1 = document.getElementById("fake");
		var listbox2 = listbox1.cloneNode();
		listbox2.setAttribute("id", eventName);
		listbox2.setAttribute("hidden", "true");
		listbox1.parentNode.appendChild(listbox2);

		// each funtion is presented as a checkbox
		for (var i = 0; i < handlers.length; i++) {
			// var checkbox = document.createElement("listitem");
			// checkbox.setAttribute("type","checkbox");
			// checkbox.setAttribute("id",i);
			// checkbox.setAttribute("label",handlers[i].getLabel());
			// //if function is enabled the checkbox is set
			// if(handlers[i].isEnabled()){
			// checkbox.setAttribute("checked",true);}
			// listbox2.appendChild(checkbox);

			var richlistitem = document.createElement("richlistitem");
			richlistitem.setAttribute("orient", "vertical");

			var checkbox = document.createElement("checkbox");
			checkbox.setAttribute("id", i);
			checkbox.setAttribute("label", handlers[i].getLabel());
			if (handlers[i].isEnabled()) {
				checkbox.setAttribute("checked", true);
			}

			var groupbox = document.createElement("groupbox");
			var caption = document.createElement("caption")
			caption.setAttribute("label", "Precondition");
			var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
			div.setAttributeNS("http://semanticturkey.uniroma2.it/ns/", "defaultPreconditionSpec",
					handlers[i].getDefaultPreconditionSpec());
			div.setAttributeNS("http://semanticturkey.uniroma2.it/ns/", "preconditionRestrictionSpec",
					handlers[i].getPreconditionRestrictionSpec());
			div.setAttributeNS("http://semanticturkey.uniroma2.it/ns/", "preconditionSpec", handlers[i]
					.getPreconditionSpec());

			CodeMirror.runMode(handlers[i].getPreconditionSpec(), "preconditions", div);

			groupbox.appendChild(caption);

			var hbox = document.createElement("hbox");
			var toolbarbutton = document.createElement("toolbarbutton");
			toolbarbutton.setAttribute("label", "Edit");
			toolbarbutton.addEventListener("command", art_semanticturkey.openPreconditionEditor);
			toolbarbutton.setAttribute("tooltiptext", "Open precondition editor");
			
			hbox.appendChild(div);
			hbox.appendChild(toolbarbutton);

			groupbox.appendChild(hbox);

			richlistitem.appendChild(checkbox);
			richlistitem.appendChild(groupbox);

			listbox2.appendChild(richlistitem);
		}
	}
};

// function that switch the listbox of function depend the selected event
art_semanticturkey.choiceFunction = function() {

	var list = document.getElementById("Events");
	var selectedItem = list.selectedItem;
	// set always the fake listbox(empty) to hidden=true
	var fake = document.getElementById("fake");
	fake.setAttribute("hidden", true);
	var eventLabel = selectedItem.getAttribute("label");
	var listbox = document.getElementById(eventLabel);

	// set all the listbox hidden
	for ( var i = 0; i < list.getRowCount(); i++) {
		var app = list.getItemAtIndex(i);
		var x = document.getElementById(app.getAttribute("label"));
		x.setAttribute("hidden", "true");
	}
	// show only selected listbox
	listbox.setAttribute("hidden", "false");

};

art_semanticturkey.openPreconditionEditor = function(event) {
	var button = event.target;
	var commonAnchestor = button.parentNode;

	var div = commonAnchestor.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "div")[0];

	var parameters = {
		defaultPreconditionSpec : div.getAttributeNS("http://semanticturkey.uniroma2.it/ns/",
				"defaultPreconditionSpec"),
		preconditionRestrictionSpec : div.getAttributeNS("http://semanticturkey.uniroma2.it/ns/",
				"preconditionRestrictionSpec")
	};

	var win = window.openDialog("chrome://semantic-turkey/content/annotation/preconditions/preconditions.xul", "dlg",
			"modal", parameters);

	if (typeof parameters.out == "string") {
		div.setAttributeNS("http://semanticturkey.uniroma2.it/ns/", "preconditionRestrictionSpec",
				parameters.out);

		var spec = div.getAttributeNS("http://semanticturkey.uniroma2.it/ns/", "defaultPreconditionSpec");

		if (parameters.out != "") {
			spec = spec + " and (" + parameters.out + ")";
		}

		div.setAttributeNS("http://semanticturkey.uniroma2.it/ns/", "preconditionSpec", spec);
		CodeMirror.runMode(spec, "preconditions", div);
	}
};

// action performed when Ok button is clicked
art_semanticturkey.onAccept = function() {
	var familyId = window.arguments[0].annotationFamilyId;
	var families = art_semanticturkey.annotation.AnnotationManager.getFamilies();
	var family = families[familyId];
	var eventHandlerMap = family.getEventHandlerMap();

	// for each event check the relative listbox of function
	for ( var eventName in eventHandlerMap) {
		var listbox = document.getElementById(eventName);
		listbox.setAttribute("hidden", "false");
		var handlers = eventHandlerMap[eventName];

		// for each function if box is checked function is enabled, else it
		// is
		// disabled
		for (var i = 0; i < listbox.getRowCount(); i++) {
			var listitem = listbox.getItemAtIndex(i);
			var enabled = listitem.getElementsByTagName("checkbox")[0].hasAttribute("checked");
			handlers[i].setEnabled(enabled);
			var spec = listitem.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "div")[0]
					.getAttributeNS("http://semanticturkey.uniroma2.it/ns/", "preconditionRestrictionSpec");
			handlers[i].setPreconditionRestrictionSpec(spec);
		}
		listbox.setAttribute("hidden", "true");
	}
};

window.addEventListener("load", art_semanticturkey.init, false);