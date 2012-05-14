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
Components.utils.import("resource://stservices/SERVICE_Property.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SKOS.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_ModifyName.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils
		.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);

art_semanticturkey.eventListenerArrayObject = null;

window.onload = function() {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	document.getElementById("buttonModify").addEventListener("command",
			art_semanticturkey.rename, true);
	document.getElementById("close").addEventListener("command",
			art_semanticturkey.onClose, true);
	var sourceElement = window.arguments[0].sourceElement;
	var sourceType = window.arguments[0].sourceType;
	var sourceElementName = window.arguments[0].sourceElementName;
	var sourceParentElementName = window.arguments[0].sourceParentElementName;
	/*if (sourceElementName.indexOf('(') > -1) {
		sourceElementName = sourceElementName.substring(0, sourceElementName
						.indexOf('('));
	}*/

	art_semanticturkey.init(sourceType, sourceElementName,
			sourceParentElementName, sourceElement);

	// add all the listener for all the events that trigger the refresh of the
	// panel
	art_semanticturkey.eventListenerArrayObject = new art_semanticturkey.eventListenerArrayClass();
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("removedClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("createdSubClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("subClsOfAddedClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("subClsOfRemovedClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("removedSuperClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("renamedClass",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("removedType",
					art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("addedType",
					art_semanticturkey.refreshPanel, null);
	
	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("resourceRenamed",
			art_semanticturkey.refreshPanel, null);

	
	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("skosConceptAdded",
			art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("skosConceptRemoved",
			art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("skosBroaderConceptAdded",
			art_semanticturkey.refreshPanel, null);

	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("skosSchemeAdded",
			art_semanticturkey.refreshPanel, null);
	art_semanticturkey.eventListenerArrayObject
	.addEventListenerToArrayAndRegister("skosSchemeRemoved",
			art_semanticturkey.refreshPanel, null);

	// art_semanticturkey.eventListenerArrayObject.addEventListenerToArrayAndRegister("",art_semanticturkey.refreshPanel,
	// null);

	art_semanticturkey.eventListenerArrayObject
			.addEventListenerToArrayAndRegister("refreshEditor",
					art_semanticturkey.refreshPanel, null);

	document.getElementById("web-link-copy")
			.addEventListener("command", art_semanticturkey.copyWebLink, true);
};

window.onunload = function() {
	art_semanticturkey.eventListenerArrayObject.deregisterAllListener();
};

/** Funzione che crea gli elementi di EditorPanel in base al type */
art_semanticturkey.init = function(type, sourceElementName, superName,
		sourceElement) {
	var mytype = type;
	// NScarpato 07-07-2008 add custom title to editor panel
	var edPnl = document.getElementById("editorPanel");

	if (mytype.indexOf("_noexpl") != -1) {
		mytype = mytype.substring(0, mytype.lastIndexOf("_noexpl"));
	}
	edPnl.setAttribute("title", mytype + " Editor");
	var mypanel = document.getElementById("myPanel");
	var buttonModify = document.getElementById("buttonModify");
	var lbl = document.createElement("label");
	lbl.setAttribute("value", mytype + " Form");
	lbl.setAttribute("class", "header");
	var img = document.createElement("image");
	var txbox = document.createElement("textbox");
	// alert("explicit = "+window.arguments[0].explicit); // da cancellare
	var isFirstEditor = window.arguments[0].isFirstEditor;
	if (type == "cls") {
		var deleteForbidden;
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this class, open the editor from the class panel");
		} else {
			deleteForbidden = window.arguments[0].deleteForbidden;
		}
		
		if (deleteForbidden == "true") {
			document.getElementById("buttonModify").disabled = true;
			// buttonModify.setAttribute("disabled", "true");
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/class_imported.png");
			// txbox.setAttribute("disabled","true");

		} else {
			img.setAttribute("src",
					"chrome://semantic-turkey/skin/images/class20x20.png");
		}
	} else if (type == "individual") {
		if (isFirstEditor == false) {
			explicit = "false";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this instance, open the editor from the class panel");
		} else {
			explicit = sourceElement.getAttribute("explicit");
		}
		
		if (explicit == "false") {
			buttonModify.setAttribute("disabled", "true");
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/individual_noexpl.png");
		} else {
			img.setAttribute("src",
					"chrome://semantic-turkey/skin/images/individual.png");
		}
	} else if (type == "Ontology") {
		document.getElementById("buttonModify").disabled = true;
	} else if (type.indexOf("ObjectProperty") != -1) {
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this property, open the editor from the property panel");
		} else {
			deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		}
		
		if (deleteForbidden == "true") {
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propObject_imported.png");
			buttonModify.setAttribute("disabled", "true");
			edPnl.setAttribute("title", "ObjectProperty Editor");
			mytype = "ObjectProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propObject20x20.png");
		}
	} else if (type.indexOf("DatatypeProperty") != -1) {
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this property, open the editor from the property panel");
		} else {
			deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		}
		
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propDatatype_imported.png");
			edPnl.setAttribute("title", "DatatypeProperty Editor");
			mytype = "DatatypeProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propDatatype20x20.png");
		}
	} else if (type.indexOf("AnnotationProperty") != -1) {
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this property, open the editor from the property panel");
		} else {
			deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		}
		
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propAnnotation_imported.png");
			edPnl.setAttribute("title", "AnnotationProperty Editor");
			mytype = "AnnotationProperty";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/propAnnotation20x20.png");
		}

	} else if (type.indexOf("Property") != -1) {
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this property, open the editor from the property panel");
		} else {
			deleteForbidden = sourceElement.getAttribute("deleteForbidden");
		}
		
		if (deleteForbidden == "true") {
			buttonModify.setAttribute("disabled", "true");
			img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/prop_imported.png");
			edPnl.setAttribute("title", "Property Editor");
			mytype = "Property";
			lbl.setAttribute("value", mytype + " Form");
		} else {
			img.setAttribute("src",
					"chrome://semantic-turkey/skin/images/prop.png");
		}

	} else if (type == "concept") {
		var deleteForbidden;
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this concept, open the editor from the skos panel");
		} else {
			deleteForbidden = window.arguments[0].deleteForbidden;
		}
		
		if (deleteForbidden == "true") {
			document.getElementById("buttonModify").disabled = true;
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/skosConcept_imported.png");
		} else {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/skosConcept20x20.png");
		}
	} else if (type == "conceptScheme") {
		var deleteForbidden;
		if (isFirstEditor == false) {
			deleteForbidden = "true";
			document
					.getElementById("buttonModify")
					.setAttribute("tooltiptext",
							"To change the name of this concept scheme, open the editor from the skos panel");
		} else {
			deleteForbidden = window.arguments[0].deleteForbidden;
		}
		
		if (deleteForbidden == "true") {
			document.getElementById("buttonModify").disabled = true;
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/skosScheme_imported.png");
		} else {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/skosScheme20x20.png");
		}
	}

	var lblName = document.createElement("label");
	lblName.setAttribute("control", "sourceElementName");
	lblName.setAttribute("value", "Name:");
	txbox.setAttribute("value", sourceElementName);
	txbox.setAttribute("actualValue", sourceElementName);
	txbox.setAttribute("id", "name");
	txbox.addEventListener("input", art_semanticturkey.setTextBluEvent, true);
	txbox.setAttribute("flex", "1");
	var titleBox = document.getElementById("titleBox");
	titleBox.appendChild(img);
	titleBox.appendChild(lbl);
	mypanel.insertBefore(lblName, buttonModify);
	mypanel.insertBefore(txbox, buttonModify);

	// Fill the rest of the editor depending on the type of the resource
	var parentBox = document.getElementById("parentBoxRows");
	try {
		var responseXML;
		if (type == "cls") {
			responseXML = art_semanticturkey.STRequests.Cls
					.getClassDescription(sourceElementName, "templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
			// add all the web link of this class
			responseXML = art_semanticturkey.STRequests.Page
					.getBookmarks(sourceElementName);
			art_semanticturkey.getWebLinks_RESPONSE(responseXML);
		} else if (type == "individual") {
			responseXML = art_semanticturkey.STRequests.Individual
					.getIndividualDescription(sourceElementName,
							"templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
			// add all the web link of this instance
			responseXML = art_semanticturkey.STRequests.Page
					.getBookmarks(sourceElementName);
			art_semanticturkey.getWebLinks_RESPONSE(responseXML);

		} else if (type == "Ontology") {
			responseXML = art_semanticturkey.STRequests.Metadata
					.getOntologyDescription();
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else if (type == "concept") {
			responseXML = art_semanticturkey.STRequests.SKOS.getConceptDescription(sourceElementName, "templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);

			// add all the web link of this instance
			responseXML = art_semanticturkey.STRequests.Page
					.getBookmarks(sourceElementName);
			art_semanticturkey.getWebLinks_RESPONSE(responseXML);
		} else if (type == "conceptScheme") {
			responseXML = art_semanticturkey.STRequests.SKOS.getConceptSchemeDescription(sourceElementName);
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else {
			responseXML = art_semanticturkey.STRequests.Property
					.getPropertyDescription(sourceElementName);
			art_semanticturkey.getPropertyDescription_RESPONSE(responseXML);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

/**
 * Populate editor panel with the web link of the selected resource
 * 
 * @param {}
 *            responseElement
 */
art_semanticturkey.getWebLinks_RESPONSE = function(responseElement) {
	document.getElementById("webLink").hidden = false;
	var bookmarksList = responseElement.getElementsByTagName("URL");
	var rowsBox = document.getElementById("rowsBoxWebLink");
	for (var i = 0; i < bookmarksList.length; i++) {
		var linkTitle = bookmarksList[i].getAttribute("title");
		var linkUrl = bookmarksList[i].getAttribute("value");
		var row = document.createElement("row");

		var label = document.createElement("label");
		label.setAttribute("value", linkTitle);
		label.setAttribute("href", linkUrl);
		label.setAttribute("class", "text-link");
		label.setAttribute("context", "web-link-context-menu");

		row.appendChild(label);

		rowsBox.appendChild(row);
	}
};

/**
 * Populate editor panel with description of selected resource
 */

art_semanticturkey.getResourceDescription_RESPONSE = function(responseElement) {
	var request = responseElement.getElementsByTagName("stresponse")[0]
			.getAttribute("request");
	art_semanticturkey.parsingType(responseElement, request);

	if (request == "getClsDescription") {
		art_semanticturkey.parsingSuperTypes(responseElement, request);
	}

	if (request == "getConceptDescription") {
		art_semanticturkey.parsingSuperTypes(responseElement, request);
	}
	
	if (request == "getConceptSchemeDescription") {
		art_semanticturkey.parsingTopConcepts(responseElement, request);
	}

	// Parsing property values of class/instance
	art_semanticturkey.parsingProperties(responseElement);
};

art_semanticturkey.getPropertyDescription_RESPONSE = function(responseElement) {
	var sourceType = window.arguments[0].sourceType;
	var domainNodeList = responseElement.getElementsByTagName("domain");
	var parentBox = document.getElementById("parentBoxRows");
	// Types hidden for property
	// Supertypes
	var request = responseElement.getElementsByTagName("stresponse")[0]
			.getAttribute("request");
	var rowsBox = document.getElementById("rowsBox");
	art_semanticturkey.parsingSuperTypes(responseElement, request);
	art_semanticturkey.parsingDomains(domainNodeList, parentBox);
	art_semanticturkey.parsingRanges(responseElement, sourceType, parentBox);
	if (sourceType.indexOf("ObjectProperty") != -1) {
		art_semanticturkey.parsingFacets(responseElement, rowsBox);
	}
	// NScarpato add property
	art_semanticturkey.parsingProperties(responseElement);
};
/**
 * Parsing superClasses of a class
 */
art_semanticturkey.parsingSuperTypes = function(responseElement, request) {
	var superTypes = responseElement.getElementsByTagName('SuperTypes');
	var superTypeList = superTypes[0].getElementsByTagName('SuperType');
	// NScarpato 26/11/2007 change types visualization added add type and remove
	// type
	var parentBox = document.getElementById("parentBoxRows");

	if (superTypeList.length > 3) {
		var typeToolbox = document.createElement("toolbox");
		var typeToolbar = document.createElement("toolbar");
		typeToolbox.appendChild(typeToolbar);
		var typeToolbarButton = document.createElement("toolbarbutton");
		var typeToolbarButton2 = document.createElement("toolbarbutton");
		if (request == "getClsDescription") { // Class
			var separator = document.createElement("separator");
			separator.setAttribute("class", "groove");
			separator.setAttribute("orient", "orizontal");
			parentBox.appendChild(separator);
			typeToolbarButton.setAttribute("image",
					"chrome://semantic-turkey/skin/images/class_create.png");
			typeToolbarButton.addEventListener("click",
					art_semanticturkey.addSuperClass, true);
			typeToolbarButton.setAttribute("tooltiptext", "Add Super Class");
			typeToolbarButton2.setAttribute("image",
					"chrome://semantic-turkey/skin/images/class_delete.png");
			typeToolbarButton2.addEventListener("click",
					art_semanticturkey.removeSuperClassEvent, true);
			var containerObj = new Object();
			containerObj.value = "list";
			containerObj.isList = true;
			typeToolbarButton2.containerObj = containerObj;
			typeToolbarButton2
					.setAttribute("tooltiptext", "Remove Super Class");
		} else if (request == "getConceptDescription") { // concept
			var separator = document.createElement("separator");
			separator.setAttribute("class", "groove");
			separator.setAttribute("orient", "orizontal");
			parentBox.appendChild(separator);
			typeToolbarButton.setAttribute("image",	"chrome://semantic-turkey/skin/images/skosC_create.png");
			typeToolbarButton.addEventListener("click",	art_semanticturkey.addBroaderConceptEvent, true);
			typeToolbarButton.setAttribute("tooltiptext", "Add Broader Concept");
			typeToolbarButton2.setAttribute("image", "chrome://semantic-turkey/skin/images/skosC_delete.png");
			typeToolbarButton2.addEventListener("click", art_semanticturkey.removeBroaderConceptEvent, true);
			typeToolbarButton2.setAttribute("tooltiptext", "Remove Broader Concept");
			var containerObj = new Object();
			containerObj.value = "list";
			containerObj.isList = true;
			typeToolbarButton2.containerObj = containerObj;
		} else { // Property
			typeToolbarButton.setAttribute("image",
					"chrome://semantic-turkey/skin/images/prop_create.png");
			typeToolbarButton.addEventListener("click",
					art_semanticturkey.addSuperProperty, true);
			typeToolbarButton.setAttribute("tooltiptext", "Add SuperProperty");
			typeToolbarButton2 = document.createElement("toolbarbutton");
			typeToolbarButton2.setAttribute("image",
					"chrome://semantic-turkey/skin/images/prop_delete.png");
			typeToolbarButton2.addEventListener("click",
					art_semanticturkey.removeSuperPropertyEvent, true);
			var containerObj = new Object();
			containerObj.superPropValue = "list";
			typeToolbarButton2.containerObj = containerObj;
			typeToolbarButton2.setAttribute("tooltiptext",
					"Remove SuperProperty");
		}
		typeToolbar.appendChild(typeToolbarButton);
		typeToolbar.appendChild(typeToolbarButton2);
		parentBox.appendChild(typeToolbox);
		var list = document.createElement("listbox");
		// check in case of class (typesList->superTypesList)
		list.setAttribute("id", "superTypesList");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		var lbl2 = document.createElement("label");
		if (request == "getClsDescription") {
			lbl2.setAttribute("value", "Super Classes:");
		} else if (request == "getConceptDescription") {
			lbl2.setAttribute("value", "Broader Concepts:");			
		} else {
			lbl2.setAttribute("value", "Super Property:");
		}
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for (var i = 0; i < superTypeList.length; i++) {
			if (superTypeList[i].nodeType == 1) {
				var lsti = document.createElement("listitem");
				var lci = document.createElement("listitem-iconic");
				var img = document.createElement("image");
				if (request == "getClsDescription") {
					img
							.setAttribute("src",
									"chrome://semantic-turkey/skin/images/class20x20.png");
				} else if(request == "getConceptDescription") {
					img
					.setAttribute("src",
							"chrome://semantic-turkey/skin/images/skosConcept20x20.png");					
				} else {
					img
							.setAttribute("src",
									"chrome://semantic-turkey/skin/images/prop20x20.png");
				}
				lci.appendChild(img);
				var lbl = document.createElement("label");
				var value = superTypeList[i].getAttribute("resource");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", superTypeList[i]
								.getAttribute("explicit"));
				lsti.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				lsti.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				lsti.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = superTypeList[i].getAttribute("explicit");
				containerObjTx.sourceElementName = value;
				if (request == "getClsDescription") // Class
					containerObjTx.sourceType = "cls";
				else
					// Property
					containerObjTx.sourceType = window.arguments[0].sourceType;
				lsti.containerObj = containerObjTx;
				lbl.setAttribute("value", value);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else {// superTypeList.length <= 3
		var lbl2 = document.createElement("label");
		var img2 = document.createElement("image");
		var row3 = document.createElement("row");
		var box2 = document.createElement("box");
		row3.setAttribute("flex", "0");
		var typeButton2 = document.createElement("toolbarbutton");

		if (request == "getClsDescription") {
			img2.setAttribute("src",
					"chrome://semantic-turkey/skin/images/class20x20.png");
			img2.setAttribute("flex", "0");
			lbl2.setAttribute("value", "Super Classes:");
			typeButton2.setAttribute("image",
					"chrome://semantic-turkey/skin/images/class_create.png");
			typeButton2.addEventListener("click",
					art_semanticturkey.addSuperClass, true);
			typeButton2.setAttribute("tooltiptext", "Add Super Class");
		} else if(request == "getConceptDescription") {
			img2.setAttribute("src",
			"chrome://semantic-turkey/skin/images/skosConcept20x20.png");
			img2.setAttribute("flex", "0");
			lbl2.setAttribute("value", "Broader Concepts:");
			typeButton2.setAttribute("image",
			"chrome://semantic-turkey/skin/images/skosC_create.png");
			typeButton2.addEventListener("click", art_semanticturkey.addBroaderConcept, true);
			typeButton2.setAttribute("tooltiptext", "Add Broader Concept");						
		} else {
			img2.setAttribute("src",
					"chrome://semantic-turkey/skin/images/prop20x20.png");
			img2.setAttribute("flex", "0");
			lbl2.setAttribute("value", "SuperProperty:");
			typeButton2.setAttribute("image",
					"chrome://semantic-turkey/skin/images/prop_create.png");
			typeButton2.addEventListener("click",
					art_semanticturkey.addSuperProperty, true);;
			typeButton2.setAttribute("tooltiptext", "Add SuperProperty");
		}

		box2.appendChild(typeButton2);
		box2.insertBefore(lbl2, typeButton2);
		box2.insertBefore(img2, lbl2);
		row3.appendChild(box2);
		parentBox.appendChild(row3);
		for (var j = 0; j < superTypeList.length; j++) {
			if (superTypeList[j].nodeType == 1) {
				var value2 = superTypeList[j].getAttribute("resource");
				var explicit = superTypeList[j].getAttribute("explicit");
				var txbox2 = document.createElement("textbox");
				txbox2.setAttribute("value", value2);
				txbox2.setAttribute("id", "tx" + value2);
				txbox2.setAttribute("readonly", "true");
				txbox2.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				txbox2.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				txbox2.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = explicit;
				containerObjTx.sourceElementName = value2;
				if (request == "getClsDescription")
					containerObjTx.sourceType = "cls";
				else
					containerObjTx.sourceType = window.arguments[0].sourceType;
				txbox2.containerObj = containerObjTx;
				var typeButton3 = document.createElement("button");
				typeButton3.setAttribute("id", "typeButton");
				typeButton3.setAttribute("flex", "0");
				if (request == "getClsDescription") {
					typeButton3.addEventListener("command",
							art_semanticturkey.removeSuperClassEvent, true);
					var containerObj = new Object();
					containerObj.value = value2;
					containerObj.isList = false;
					typeButton3.containerObj = containerObj;
					typeButton3.setAttribute("label", "Remove Super Class");
					typeButton3
							.setAttribute("image",
									"chrome://semantic-turkey/skin/images/class_delete.png");
				} else if(request == "getConceptDescription") {
					typeButton3.addEventListener("command",
							art_semanticturkey.removeBroaderConceptEvent, true);
					var containerObj = new Object();
					containerObj.value = value2;
					containerObj.isList = false;
					typeButton3.containerObj = containerObj;
					typeButton3.setAttribute("label", "Remove Broader Concept");
					typeButton3
							.setAttribute("image",
									"chrome://semantic-turkey/skin/images/skosC_delete.png");					
				} else {
					typeButton3.addEventListener("command",
							art_semanticturkey.removeSuperPropertyEvent, true);
					var containerObj = new Object();
					containerObj.superPropValue = value2;
					typeButton3.containerObj = containerObj;
					typeButton3.setAttribute("label", "Remove SuperProperty");
					typeButton3
							.setAttribute("image",
									"chrome://semantic-turkey/skin/images/prop_delete.png");
				}
				if (explicit == "false") {
					typeButton3.setAttribute("disabled", "true");

				}
				var row4 = document.createElement("row");
				row4.setAttribute("id", value2);
				row4.appendChild(typeButton3);
				row4.insertBefore(txbox2, typeButton3);

				parentBox.appendChild(row4);
			}
		}
	}

};
/**
 * Parsing type of class or instance (even ontology)
 */
art_semanticturkey.parsingType = function(responseElement, request) {
	var types = responseElement.getElementsByTagName('Types');
	var typeList = types[0].getElementsByTagName('Type');
	var parentBox = document.getElementById("parentBoxRows");
	if (typeList.length > 3) {
		var typeToolbox = document.createElement("toolbox");
		var typeToolbar = document.createElement("toolbar");
		typeToolbox.appendChild(typeToolbar);
		var typeToolbarButton = document.createElement("toolbarbutton");
		typeToolbarButton.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		if (request == "getClsDescription") {
			typeToolbarButton.addEventListener("click",
					art_semanticturkey.addTypeEvent, true);
			var containerObj = new Object();
			containerObj.type = "Class";
			typeToolbarButton.containerObj = containerObj;
		} else {
			typeToolbarButton.addEventListener("click",
					art_semanticturkey.addTypeEvent, true);
			var containerObj = new Object();
			containerObj.type = "individual";
			typeToolbarButton.containerObj = containerObj;
		}
		typeToolbarButton.setAttribute("tooltiptext", "Add Type");
		typeToolbar.appendChild(typeToolbarButton);
		var typeToolbarButton2 = document.createElement("toolbarbutton");
		typeToolbarButton2.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_delete.png");
		typeToolbarButton2.addEventListener("click",
				art_semanticturkey.removeTypeEvent, true);
		var containerObj = new Object();
		containerObj.value = "list";
		containerObj.sourceType = window.arguments[0].sourceType;
		containerObj.isList = true;
		typeToolbarButton2.containerObj = containerObj;

		typeToolbarButton2.setAttribute("tooltiptext", "Remove Type");
		typeToolbar.appendChild(typeToolbarButton2);
		parentBox.appendChild(typeToolbox);
		var list = document.createElement("listbox");
		list.setAttribute("id", "typesList");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		var lbl2 = document.createElement("label");
		lbl2.setAttribute("value", "Types:");
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for (var i = 0; i < typeList.length; i++) {
			if (typeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/class20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = typeList[i].getAttribute("class");
				lsti.setAttribute("label", value);
				lsti.setAttribute("explicit", typeList[i]
								.getAttribute("explicit"));
				lsti.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				lsti.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				lsti.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = typeList[i].getAttribute("explicit");
				containerObjTx.sourceElementName = value;
				containerObjTx.sourceType = "cls";
				lsti.containerObj = containerObjTx;
				lbl.setAttribute("value", value);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else {
		var lbl = document.createElement("label");
		var img = document.createElement("image");
		img.setAttribute("src",
				"chrome://semantic-turkey/skin/images/class20x20.png");
		img.setAttribute("flex", "0");
		lbl.setAttribute("value", "Types:");
		var row = document.createElement("row");
		var box = document.createElement("box");
		row.setAttribute("flex", "0");
		var typeButton = document.createElement("toolbarbutton");
		if (request == "getClsDescription") {
			typeButton.addEventListener("click",
					art_semanticturkey.addTypeEvent, true);
			var containerObj = new Object();
			containerObj.type = "Class";
			typeButton.containerObj = containerObj;
		} else { // individual
			typeButton.addEventListener("click",
					art_semanticturkey.addTypeEvent, true);
			var containerObj = new Object();
			containerObj.type = "individual";
			typeButton.containerObj = containerObj;
		}
		typeButton.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		typeButton.setAttribute("tooltiptext", "Add Type");
		box.appendChild(typeButton);
		box.insertBefore(lbl, typeButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for (var j = 0; j < typeList.length; j++) {
			if (typeList[j].nodeType == 1) {
				var value = typeList[j].getAttribute("class");
				var explicit = typeList[j].getAttribute("explicit");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("id", "tx" + value);
				txbox.setAttribute("value", value);
				txbox.setAttribute("readonly", "true");
				txbox.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				txbox.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				txbox.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = explicit;
				containerObjTx.sourceElementName = value;
				containerObjTx.sourceType = "cls";
				txbox.containerObj = containerObjTx;
				var typeButton = document.createElement("button");
				typeButton.setAttribute("id", "typeButton");
				typeButton.setAttribute("flex", "0");
				typeButton.addEventListener("command",
						art_semanticturkey.removeTypeEvent, true);
				var containerObj = new Object();
				containerObj.value = value;
				containerObj.sourceType = window.arguments[0].sourceType;
				containerObj.isList = false;
				typeButton.containerObj = containerObj;
				if (explicit == "false") {
					typeButton.setAttribute("disabled", "true");
				}

				typeButton.setAttribute("label", "Remove Type");
				typeButton
						.setAttribute("image",
								"chrome://semantic-turkey/skin/images/class_delete.png");
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(typeButton);
				row2.insertBefore(txbox, typeButton);
				parentBox.appendChild(row2);
			}
		}
	}
};

art_semanticturkey.parsingProperties = function(responseElement) {
	var properties = responseElement.getElementsByTagName('Properties');
	var propertyList = properties[0].getElementsByTagName('Property');
	var rowsBox = document.getElementById("rowsBox");
	var propTitle = document.createElement("label");
	propTitle.setAttribute("value", "Properties:");
	var rowTitle = document.createElement("row");
	rowTitle.setAttribute("align", "center");
	rowTitle.setAttribute("pack", "center");
	rowTitle.setAttribute("flex", "0");
	var titleBox = document.createElement("box");
	var typeTitleToolbarButton = document.createElement("toolbarbutton");
	typeTitleToolbarButton.setAttribute("image",
			"chrome://semantic-turkey/skin/images/prop_create.png");
	typeTitleToolbarButton.addEventListener("click",
			art_semanticturkey.addNewProperty, true);
	typeTitleToolbarButton.setAttribute("tooltiptext", "Add New Property");
	titleBox.appendChild(typeTitleToolbarButton);
	titleBox.insertBefore(propTitle, typeTitleToolbarButton);
	rowTitle.appendChild(titleBox);
	rowsBox.appendChild(rowTitle);

	for (var i = 0; i < propertyList.length; i++) {
		if (propertyList[i].nodeType == 1) {
			var nameValue = propertyList[i].getAttribute("name");
			var typeValue = propertyList[i].getAttribute("type");
			var row = document.createElement("row");
			var box3 = document.createElement("box");
			var typeToolbarButton = document.createElement("toolbarbutton");
			var lblic = document.createElement("label-iconic");
			var lbl = document.createElement("label");
			var img = document.createElement("image");
						
			if (typeValue.indexOf("owl:ObjectProperty") != -1) {
				// typeToolbarButton
				// .setAttribute("image",
				// "chrome://semantic-turkey/skin/images/propObject_create.png");
				typeToolbarButton.addEventListener("click",
						art_semanticturkey.createAndAddPropValueEvent, true);
				var containerObj = new Object();
				containerObj.propertyQName = nameValue;
				containerObj.typeValue = typeValue;
				typeToolbarButton.containerObj = containerObj;
				typeToolbarButton.setAttribute("tooltiptext",
						"Add and Create Value");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/propObject20x20.png");
				img.setAttribute("flex", "0");				
			} else if (typeValue.indexOf("owl:DatatypeProperty") != -1) {
				// typeToolbarButton
				// .setAttribute("image",
				// "chrome://semantic-turkey/skin/images/propDatatype_create.png");
				typeToolbarButton.addEventListener("click",
						art_semanticturkey.createAndAddPropValueEvent, true);
				var containerObj = new Object();
				containerObj.propertyQName = nameValue;
				containerObj.typeValue = typeValue;
				typeToolbarButton.containerObj = containerObj;
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/propDatatype20x20.png");
				img.setAttribute("flex", "0");
			} else if (typeValue.indexOf("owl:AnnotationProperty") != -1) {
				// typeToolbarButton
				// .setAttribute("image",
				// "chrome://semantic-turkey/skin/images/propAnnotation_create.png");
				typeToolbarButton.addEventListener("click",
						art_semanticturkey.createAndAddPropValueEvent, true);
				var containerObj = new Object();
				containerObj.propertyQName = nameValue;
				containerObj.typeValue = typeValue;
				typeToolbarButton.containerObj = containerObj;
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/propAnnotation20x20.png");
				img.setAttribute("flex", "0");
			} else if (typeValue.indexOf("rdf:Property") != -1) {
				/*
				 * typeToolbarButton .setAttribute("image",
				 * "chrome://semantic-turkey/skin/images/prop_create.png");
				 */
				typeToolbarButton.addEventListener("click",
						art_semanticturkey.createAndAddPropValueEvent, true);
				var containerObj = new Object();
				containerObj.propertyQName = nameValue;
				containerObj.typeValue = typeValue;
				typeToolbarButton.containerObj = containerObj;
				typeToolbarButton.setAttribute("tooltiptext", "Add Value");
				var typeToolbarButtonLiteral = document
						.createElement("toolbarbutton");
				typeToolbarButtonLiteral.addEventListener("click",
						art_semanticturkey.createAndAddPropValueEvent, true);
//				var containerObj = new Object();
//				containerObj.propertyQName = nameValue;
//				containerObj.typeValue = typeValue;
//				containerObj.isLiteral = "true";
//				typeToolbarButtonLiteral.containerObj = containerObj;
//
//				typeToolbarButtonLiteral
//						.setAttribute("image",
//								"chrome://semantic-turkey/skin/images/Blocnote-32.png");
//				typeToolbarButtonLiteral.setAttribute("tooltiptext",
//						"Add Literal Value");
//				img
//						.setAttribute("src",
//								"chrome://semantic-turkey/skin/images/prop20x20.png");
//				img.setAttribute("flex", "0");
//				box3.appendChild(typeToolbarButtonLiteral);
			}

			lbl.setAttribute("value", nameValue);
			// check if value is uri and enable openlink

			typeToolbarButton
					.setAttribute("image",
							"chrome://semantic-turkey/skin/images/individual_add.png");
//			if (typeValue.indexOf("rdf:Property") != -1) {
//				box3.insertBefore(typeToolbarButton, typeToolbarButtonLiteral);
//			} else {
			
				box3.appendChild(typeToolbarButton);
				
//			}
			lblic.appendChild(img);
			lblic.appendChild(lbl);
			box3.insertBefore(lblic, typeToolbarButton);
			row.setAttribute("flex", "0");
			row.appendChild(box3);
			rowsBox.appendChild(row);
			var valueList = propertyList[i].childNodes;
			var valuesCounter = 0; 
			for (var j = 0; j < valueList.length; j++) {
					if (typeof(valueList[j].tagName) != 'undefined') {
						valuesCounter++;
					}
			}
			if (valuesCounter > 10) {
				var typeToolbarButton2 = document
						.createElement("toolbarbutton");
				typeToolbarButton2
						.setAttribute("image",
								"chrome://semantic-turkey/skin/images/individual_remove.png");
				if (typeValue == "owl:ObjectProperty") {
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
					var containerObj = new Object();
					containerObj.value = "list";
					containerObj.nameValue = nameValue;
					containerObj.typeValue = typeValue;
					typeToolbarButton2.containerObj = containerObj;
					typeToolbarButton2.addEventListener("click",
							art_semanticturkey.removePropValueEvent, true);
					var propertyToolbar = document.createElement("toolbar");

				} else if (typeValue == "owl:DatatypeProperty") {
					var containerObj = new Object();
					containerObj.value = "list";
					containerObj.nameValue = nameValue;
					containerObj.typeValue = typeValue;
					typeToolbarButton2.containerObj = containerObj;
					typeToolbarButton2.addEventListener("click",
							art_semanticturkey.removePropValueEvent, true);
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");

				} else if (typeValue == "owl:AnnotationProperty") {
					var containerObj = new Object();
					containerObj.value = "list";
					containerObj.nameValue = nameValue;
					containerObj.typeValue = typeValue;
					typeToolbarButton2.containerObj = containerObj;
					typeToolbarButton2.addEventListener("click",
							art_semanticturkey.removePropValueEvent, true);
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
				} else {
					var containerObj = new Object();
					containerObj.value = "list";
					containerObj.nameValue = nameValue;
					containerObj.typeValue = typeValue;
					typeToolbarButton2.containerObj = containerObj;
					typeToolbarButton2.addEventListener("click",
							art_semanticturkey.removePropValueEvent, true);
					typeToolbarButton2.setAttribute("tooltiptext",
							"Remove Value");
				}
				box3.insertBefore(typeToolbarButton2, typeToolbarButton);
				box3.insertBefore(typeToolbarButton, typeToolbarButton2);
				// propertyToolbar.appendChild(typeToolbarButton2);
				var propList = document.createElement("listbox");
				propList.setAttribute("id", nameValue);				
				propList.setAttribute("flex", "1");
				for (var j = 0; j < valueList.length; j++) {
					if (typeof(valueList[j].tagName) != 'undefined') {
					var lbl = document.createElement("label");
					//var value = valueList[j].getAttribute("value");
					var value = valueList[j].getAttribute("show");
					var type = valueList[j].tagName;
					var rangeQName =null;
					if(valueList[j].getAttribute("type") != 'undefined'){
						rangeQName =valueList[j].getAttribute("type");
						}
					var lsti = document.createElement("listitem");
					var lci = document.createElement("listitem-iconic");
					if(type.indexOf("resource") !=-1 || type.indexOf("bnode") !=-1 || type.indexOf("uri") !=-1){
						lbl.setAttribute("value", value);
						lsti.setAttribute("type", type);
						var role = valueList[j].getAttribute("role");
						if (role == "individual") {
							var img = document.createElement("image");
							img
									.setAttribute("src",
											"chrome://semantic-turkey/skin/images/individual.png");
							lci.appendChild(img);
						} else if (role == "cls") {
							var img = document.createElement("image");
							img
									.setAttribute("src",
											"chrome://semantic-turkey/skin/images/class20x20.png");
							lci.appendChild(img);
						} else if (role == "concept") {
							var img = document.createElement("image");
							img
									.setAttribute("src",
											"chrome://semantic-turkey/skin/images/skosConcept20x20.png");
							lci.appendChild(img);
						} else if (role == "conceptScheme") {
							var img = document.createElement("image");
							img
									.setAttribute("src",
											"chrome://semantic-turkey/skin/images/skosScheme20x20.png");
							lci.appendChild(img);
						}
						

						var containerObjTx = new Object();
						containerObjTx.explicit = explicit;
						containerObjTx.sourceElementName = value;
						containerObjTx.rangeQName=rangeQName;
						if (role == "cls")
							containerObjTx.sourceType = "cls";
						else if (role == "individual")
							containerObjTx.sourceType = "individual";
						else if (role == "concept")
							containerObjTx.sourceType = "concept";							
						else if (role == "conceptScheme")
							containerObjTx.sourceType = "conceptScheme";							
						else
							// property
							containerObjTx.sourceType = "property";
						
						lsti.containerObj = containerObjTx;
						lsti.addEventListener("dblclick",
								art_semanticturkey.resourcedblClickEvent, true);
						lsti.addEventListener("mouseover",
								art_semanticturkey.setCursorPointerEvent, true);
						lsti.addEventListener("mouseout",
								art_semanticturkey.setCursorDefaultEvent, true);
					}else if(type.indexOf("plainLiteral")!=-1){
						var lang = valueList[j].getAttribute("lang");
						lbl.setAttribute("value", value + " (language: " + lang
										+ ")");
						lsti.setAttribute("language", lang);
						lsti.setAttribute("typeValue", role);
						lsti.setAttribute("type", type);
					} else if(type.indexOf("typedLiteral")!=-1){
						var roleLbl = role.substring(type.indexOf('#') + 1);
						lbl.setAttribute("value", value + " (datatype: " + roleLbl
										+ ")");
						lsti.setAttribute("type", type);
					}
					lci.appendChild(lbl);
					lsti.setAttribute("label", value);
					var explicit = valueList[j].getAttribute("explicit");
					lsti.setAttribute("explicit", explicit);
					lsti.appendChild(lci);
					propList.appendChild(lsti);
				}
				var row2 = document.createElement("row");
				row2.appendChild(propList);
				rowsBox.appendChild(row2);
			}
			} else { // valueList.length <= 10
				for (var j = 0; j < valueList.length; j++) {
					if (typeof(valueList[j].tagName) != 'undefined') {
						var value = valueList[j].getAttribute("show");
						var explicit = valueList[j].getAttribute("explicit");
						//var valueType = valueList[j].getAttribute("type");
						var valueType = valueList[j].tagName;
						
					if(valueList[j].getAttribute("type") != 'undefined'){
						rangeQName =valueList[j].getAttribute("type");
						
					}
						row2 = document.createElement("row");
						var txbox = document.createElement("textbox");
						txbox.setAttribute("id", value);
						txbox.setAttribute("typeValue", typeValue);
						txbox.setAttribute("value", value);
						txbox.setAttribute("readonly", "true");
						txbox.setAttribute("rangeQName",rangeQName);
						propButton = document.createElement("button");
						propButton.setAttribute("flex", "0");
						var resImg = document.createElement("image");
						if(valueType.indexOf("resource") !=-1 || valueType.indexOf("bnode")!=-1 || valueType.indexOf("uri")!=-1){
						var role = valueList[j].getAttribute("role");
						
						if (role == "conceptScheme") {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/skosScheme_delete.png");

							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/skosScheme_imported.png");

							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/skosScheme20x20.png");
							}
							txbox.setAttribute("tooltiptext",
									"Editable Resource");
							txbox.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							txbox.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							txbox.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObj = new Object();
							containerObj.explicit = explicit;
							containerObj.sourceElementName = value;
							containerObj.sourceType = role;
							containerObj.rangeQName = rangeQName;
							txbox.containerObj = containerObj;
							// txbox.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// resImg.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// txbox.addEventListener("mouseout",
							// art_semanticturkey.setCursorDefaultEvent, true);
						} else if (role == "concept") {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/skosC_delete.png");

							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/skosConcept_imported.png");

							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/skosConcept20x20.png");
							}
							txbox.setAttribute("tooltiptext",
									"Editable Resource");
							txbox.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							txbox.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							txbox.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObj = new Object();
							containerObj.explicit = explicit;
							containerObj.sourceElementName = value;
							containerObj.sourceType = role;
							containerObj.rangeQName = rangeQName;
							txbox.containerObj = containerObj;
							// txbox.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// resImg.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// txbox.addEventListener("mouseout",
							// art_semanticturkey.setCursorDefaultEvent, true);
						} else if (role == "individual") {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/individual_remove.png");

							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/individual_noexpl.png");

							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/individual20x20.png");
							}
							txbox.setAttribute("tooltiptext",
									"Editable Resource");
							txbox.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							txbox.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							txbox.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObj = new Object();
							containerObj.explicit = explicit;
							containerObj.sourceElementName = value;
							containerObj.sourceType = role;
							containerObj.rangeQName = rangeQName;
							txbox.containerObj = containerObj;
							// txbox.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// resImg.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// txbox.addEventListener("mouseout",
							// art_semanticturkey.setCursorDefaultEvent, true);
						} else if (role == "cls") {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/class_delete.png");
							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/class_imported.png");
							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/class20x20.png");
							}
							txbox.setAttribute("tooltiptext",
									"Editable Resource");
							txbox.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							txbox.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							txbox.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObj = new Object();
							containerObj.explicit = explicit;
							containerObj.sourceElementName = value;
							containerObj.rangeQName = rangeQName;
							containerObj.sourceType = role;
							txbox.containerObj = containerObj;
							// txbox.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// resImg.addEventListener("mouseover",
							// art_semanticturkey.setCursorPointerEvent, true);
							// txbox.addEventListener("mouseout",
							// art_semanticturkey.setCursorDefaultEvent, true);
						}
						}else if(valueType.indexOf("plainLiteral")!=-1){
						//else if (valueType.indexOf("DatatypeProperty") != -1) {
							if (art_semanticturkey.isUrl(value)) {
								txbox.setAttribute("class", "text-link");
								txbox.addEventListener("click",
										art_semanticturkey.openUrlEvent, true);
								var containerObj = new Object();
								containerObj.value = value;
								containerObj.rangeQName = rangeQName;
								txbox.containerObj = containerObj;
								
								txbox
										.addEventListener(
												"mouseover",
												art_semanticturkey.setCursorPointerEvent,
												true);
								txbox
										.addEventListener(
												"mouseout",
												art_semanticturkey.setCursorDefaultEvent,
												true);
							}
							var lang = valueList[j].getAttribute("lang");
							if(lang !=null){
								txbox.setAttribute("value", value + " (language: "+ lang + ")");
								txbox.setAttribute("language", lang);
							}

						}else if(valueType.indexOf("typedLiteral")!= -1){
							var rangeQNameLbl = rangeQName.substring(rangeQName.indexOf('#') + 1);
							txbox.setAttribute("value", value + " (datatype: "+ rangeQNameLbl + ")");
							var typeQName = valueList[j].getAttribute("typeQName");
							if(typeQName!=null){
								txbox.setAttribute("typeQName", typeQName);
							}
							if (art_semanticturkey.isUrl(value)) {
								txbox.setAttribute("class", "text-link");
								txbox.addEventListener("click",
										art_semanticturkey.openUrlEvent, true);
								var containerObj = new Object();
								containerObj.value = value;
								containerObj.rangeQName=rangeQName;
								txbox.containerObj = containerObj;
								txbox
										.addEventListener(
												"mouseover",
												art_semanticturkey.setCursorPointerEvent,
												true);
								txbox
										.addEventListener(
												"mouseout",
												art_semanticturkey.setCursorDefaultEvent,
												true);
							}
						}
						
						if (valueType.indexOf("DatatypeProperty") != -1) {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/prop_delete.png");
							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propDatatype_imported.png");
							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propDatatype20x20.png");
							}
							
						} else if (valueType.indexOf("ObjectProperty") != -1) {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/prop_delete.png");
							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propObject_imported.png");
							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propObject20x20.png");
							}
							
						} else if (valueType.indexOf("AnnotationProperty") != -1) {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/prop_delete.png");
							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propAnnotation_imported.png");
							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/propAnnotation20x20.png");
							}
							
						} else if (valueType.indexOf("Property") != -1) {
							propButton
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/prop_delete.png");
							if (explicit == "false") {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/prop_imported.png");
							} else {
								resImg
										.setAttribute("src",
												"chrome://semantic-turkey/skin/images/prop.png");
							}
							
						} else if (valueType.indexOf("bnodes") != -1) {
							// vedere se mettere img o no
						}
						if (nameValue == "rdfs:comment") {
							txbox.setAttribute("cols", "1");
							txbox.setAttribute("rows", "3");
							txbox.setAttribute("wrap", "on");
							txbox.setAttribute("multiline", "true");
						}
						propButton.setAttribute("label", "Remove Value");
						var containerObj = new Object();
						containerObj.value = value;
						containerObj.nameValue = nameValue;
						containerObj.typeValue = typeValue;
						containerObj.rangeQName = rangeQName;
						containerObj.valueType = valueType;
						if(valueType.indexOf("literal") !=-1){
							var typeQName = valueList[j].getAttribute("typeQName");
							containerObj.typeQName=typeQName;
						}
						propButton.containerObj = containerObj;
						propButton.addEventListener("command",
								art_semanticturkey.removePropValueEvent, true);
						if (explicit == "false") {
							propButton.setAttribute("disabled", "true");
						}
						var vbox = document.createElement("vbox");
						var spacer = document.createElement("spacer");
						spacer.setAttribute("flex","1");
						vbox.appendChild(propButton);
						vbox.appendChild(spacer);
						//row2.appendChild(propButton);
						row2.appendChild(vbox);
						txbox.appendChild(resImg);
						//row2.insertBefore(txbox, propButton);
						row2.insertBefore(txbox, vbox);
						rowsBox.appendChild(row2);
					
				}
				}
			}

		}
	}
};

art_semanticturkey.parsingDomains = function(domainNodeList, parentBox) {
	if (domainNodeList.length > 3) {
		var domainToolbox = document.createElement("toolbox");
		var domainToolbar = document.createElement("toolbar");
		domainToolbox.appendChild(domainToolbar);
		var domainToolbarButton = document.createElement("toolbarbutton");
		domainToolbarButton.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		domainToolbarButton.addEventListener("click",
				art_semanticturkey.insertDomain, true);
		domainToolbarButton.setAttribute("tooltiptext", "Add Domain");
		domainToolbar.appendChild(domainToolbarButton);
		var domainToolbarButton2 = document.createElement("toolbarbutton");
		domainToolbarButton2.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_delete.png");
		domainToolbarButton2.addEventListener("click",
				art_semanticturkey.removeDomainEvent, true);
		var containerObj = new Object();
		containerObj.domainValue = "no";
		containerObj.isList = "true";
		domainToolbarButton2.containerObj = containerObj;
		domainToolbarButton2.setAttribute("tooltiptext", "Remove Domain");
		domainToolbar.appendChild(domainToolbarButton2);
		parentBox.appendChild(domainToolbox);
		var list = document.createElement("listbox");
		list.setAttribute("id", "domainsList");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		var lbl2 = document.createElement("label");
		lbl2.setAttribute("value", "Domains:");
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for (var i = 0; i < domainNodeList.length; i++) {
			if (domainNodeList[i].nodeType == 1) {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/class20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = domainNodeList[i].getAttribute("name");
				lsti.setAttribute("label", value);
				var explicit = domainNodeList[i].getAttribute("explicit");
				lsti.setAttribute("explicit", explicit);
				lsti.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				lsti.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				lsti.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = explicit;
				containerObjTx.sourceElementName = value;
				containerObjTx.sourceType = "cls";
				lsti.containerObj = containerObjTx;
				lbl.setAttribute("value", value);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else { // domainNodeList.length <= 3
		var lbl = document.createElement("label");
		var img = document.createElement("image");
		img.setAttribute("src",
				"chrome://semantic-turkey/skin/images/class20x20.png");
		lbl.setAttribute("value", "Domains:");
		var row = document.createElement("row");
		var box = document.createElement("box");
		//row.setAttribute("flex", "4");
		var domainButton = document.createElement("toolbarbutton");
		domainButton.addEventListener("click", art_semanticturkey.insertDomain,
				true);
		domainButton.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		domainButton.setAttribute("tooltiptext", "Add domain");
		box.appendChild(domainButton);
		box.insertBefore(lbl, domainButton);
		box.insertBefore(img, lbl);
		row.appendChild(box);
		parentBox.appendChild(row);
		for (var j = 0; j < domainNodeList.length; j++) {
			if (domainNodeList[j].nodeType == 1) {
				var value = domainNodeList[j].getAttribute("name");
				var txbox = document.createElement("textbox");
				txbox.setAttribute("value", value);
				txbox.setAttribute("id", "tx" + value);
				txbox.setAttribute("explicit", explicit);
				txbox.setAttribute("readonly", "true");
				txbox.addEventListener("dblclick",
						art_semanticturkey.resourcedblClickEvent, true);
				txbox.addEventListener("mouseover",
						art_semanticturkey.setCursorPointerEvent, true);
				txbox.addEventListener("mouseout",
						art_semanticturkey.setCursorDefaultEvent, true);

				var containerObjTx = new Object();
				containerObjTx.explicit = explicit;
				containerObjTx.sourceElementName = value;
				containerObjTx.sourceType = "cls";
				txbox.containerObj = containerObjTx;
				var domainButton = document.createElement("button");
				domainButton.setAttribute("id", "domainButton");
				domainButton.setAttribute("flex", "0");
				domainButton.addEventListener("click",
						art_semanticturkey.removeDomainEvent, true);
				var containerObj = new Object();
				containerObj.domainValue = value;
				containerObj.isList = "false";
				domainButton.containerObj = containerObj;
				domainButton.setAttribute("label", "Remove Domain");
				domainButton
						.setAttribute("image",
								"chrome://semantic-turkey/skin/images/class_delete.png");
				var explicit = domainNodeList[j].getAttribute("explicit");
				if (explicit == "false") {
					domainButton.setAttribute("disabled", "true");
				}
				var row2 = document.createElement("row");
				row2.setAttribute("id", value);
				row2.appendChild(domainButton);
				row2.insertBefore(txbox, domainButton);
				parentBox.appendChild(row2);
			}
		}
	}
};
art_semanticturkey.parsingRanges = function(responseElement, sourceType,
		parentBox) {
	//var rangeList = responseElement.getElementsByTagName('range');
	var ranges = responseElement.getElementsByTagName("ranges")[0];
	var rangeList = ranges.childNodes;
	var rangeCounter = 0;
	for (var k = 0; k < rangeList.length; k++) {
			if (typeof(rangeList[k].tagName) != 'undefined') {
				rangeCounter++;
			}	
	}
	if (sourceType.indexOf("AnnotationProperty") != -1) {
		return;
	} else if (rangeCounter > 3) {
		var separator = document.createElement("separator");
		separator.setAttribute("class", "groove");
		separator.setAttribute("orient", "orizontal");
		parentBox.appendChild(separator);
		var typeToolbox = document.createElement("toolbox");
		var typeToolbar = document.createElement("toolbar");
		typeToolbox.appendChild(typeToolbar);
		var typeToolbarButton = document.createElement("toolbarbutton");
		typeToolbarButton.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		typeToolbarButton.addEventListener("click",
				art_semanticturkey.insertRange, true);
		typeToolbarButton.setAttribute("tooltiptext", "Add Range");
		typeToolbar.appendChild(typeToolbarButton);
		var typeToolbarButton2 = document.createElement("toolbarbutton");
		typeToolbarButton2.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_delete.png");
		typeToolbarButton2.addEventListener("click",
				art_semanticturkey.removeRangeEvent, true);
		var containerObj = new Object();
		containerObj.value = "";
		containerObj.isList = "true";
		typeToolbarButton2.containerObj = containerObj;
		typeToolbarButton2.setAttribute("tooltiptext", "Remove Range");
		typeToolbar.appendChild(typeToolbarButton2);
		parentBox.appendChild(typeToolbox);
		var list = document.createElement("listbox");
		list.setAttribute("id", "rangesList");
		list.setAttribute("flex", "1");
		var listhead = document.createElement("listhead");
		var listheader = document.createElement("listheader");
		var listitem_iconic = document.createElement("listitem-iconic");
		lbl2 = document.createElement("label");
		lbl2.setAttribute("value", "Ranges:");
		listitem_iconic.appendChild(lbl2);
		listheader.appendChild(listitem_iconic);
		listhead.appendChild(listheader);
		list.appendChild(listhead);
		parentBox.appendChild(list);
		for (var k = 0; k < rangeList.length; k++) {
			if (typeof(rangeList[k].tagName) != 'undefined') {
				lsti = document.createElement("listitem");
				lci = document.createElement("listitem-iconic");
				img = document.createElement("image");
				img
						.setAttribute("src",
								"chrome://semantic-turkey/skin/images/class20x20.png");
				lci.appendChild(img);
				lbl = document.createElement("label");
				var value = rangeList[k].getAttribute("show");
				lsti.setAttribute("label", value);
				var explicit = rangeList[k].getAttribute("explicit");
				lsti.setAttribute("explicit", explicit);
				if (sourceType == "ObjectProperty") {
					lsti.addEventListener("dblclick",
							art_semanticturkey.resourcedblClickEvent, true);
					lsti.addEventListener("mouseover",
							art_semanticturkey.setCursorPointerEvent, true);
					lsti.addEventListener("mouseout",
							art_semanticturkey.setCursorDefaultEvent, true);

					var containerObjTx = new Object();
					containerObjTx.explicit = explicit;
					containerObjTx.sourceElementName = value;
					containerObjTx.sourceType = "cls";
					lsti.containerObj = containerObjTx;
				}
				lbl.setAttribute("value", value);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				list.appendChild(lsti);
			}
		}
	} else { // rangeList.length <= 3
		var lbl2 = document.createElement("label");
		var img2 = document.createElement("image");
		img2.setAttribute("src",
				"chrome://semantic-turkey/skin/images/class20x20.png");
		lbl2.setAttribute("value", "Ranges:");
		var row3 = document.createElement("row");
		var box2 = document.createElement("box");
		row3.setAttribute("flex", "0");
		var typeButton2 = document.createElement("toolbarbutton");
		typeButton2.setAttribute("image",
				"chrome://semantic-turkey/skin/images/class_create.png");
		typeButton2.addEventListener("click", art_semanticturkey.insertRange,
				true);
		typeButton2.setAttribute("tooltiptext", "Add Range");
		if (sourceType.indexOf("DatatypeProperty") != -1
				&& rangeList.length != 0) {
			typeButton2.setAttribute("disabled", true);
		}
		box2.appendChild(typeButton2);
		box2.insertBefore(lbl2, typeButton2);
		box2.insertBefore(img2, lbl2);
		row3.appendChild(box2);
		parentBox.appendChild(row3);
		for (var h = 0; h < rangeList.length; h++) {
			if (typeof(rangeList[h].tagName) != 'undefined') {
				var value2 = rangeList[h].getAttribute("show");
				var txbox2 = document.createElement("textbox");
				txbox2.setAttribute("value", value2);
				txbox2.setAttribute("readonly", "true");
				txbox2.setAttribute("id", "tx" + value2);
				if (sourceType == "ObjectProperty") {
					txbox2.addEventListener("dblclick",
							art_semanticturkey.resourcedblClickEvent, true);
					txbox2.addEventListener("mouseover",
							art_semanticturkey.setCursorPointerEvent, true);
					txbox2.addEventListener("mouseout",
							art_semanticturkey.setCursorDefaultEvent, true);

					var containerObjTx = new Object();
					containerObjTx.explicit = "false";
					containerObjTx.sourceElementName = value2;
					containerObjTx.sourceType = "cls";
					txbox2.containerObj = containerObjTx;
				}
				var typeButton3 = document.createElement("button");
				typeButton3.setAttribute("id", "typeButton");
				typeButton3
						.setAttribute("image",
								"chrome://semantic-turkey/skin/images/class_delete.png");
				typeButton3.setAttribute("flex", "0");
				typeButton3.addEventListener("click",
						art_semanticturkey.removeRangeEvent, true);
				var containerObj = new Object();
				containerObj.value = value2;
				containerObj.isList = "false";
				typeButton3.containerObj = containerObj;
				typeButton3.setAttribute("label", "Remove Range");
				var explicit = rangeList[h].getAttribute("explicit");
				if (explicit == "false") {
					typeButton3.setAttribute("disabled", "true");
				}
				var row4 = document.createElement("row");
				row4.setAttribute("id", value2);
				row4.appendChild(typeButton3);
				row4.insertBefore(txbox2, typeButton3);
				parentBox.appendChild(row4);
			}
		}
	}
};
/**
 * Parsing facets
 */
art_semanticturkey.parsingFacets = function(responseElement, rowsBox) {
	var facets = responseElement.getElementsByTagName('facets');
	var facetsList = facets[0].childNodes;
	var rowBox = document.getElementById("rowsBox");
	var ftitle = document.createElement("label");
	ftitle.setAttribute("value", "Facets:");
	var row = document.createElement("row");
	row.appendChild(ftitle);
	rowBox.appendChild(row);

	// functional, transitive, inverseFunctional symmetric
	var row = document.createElement("row");
	row.setAttribute("flex", "1");
	row.setAttribute("align", "start");
	row.setAttribute("pack", "start");
	var facetsBox = document.createElement("box");
	facetsBox.setAttribute("flex", "1");
	var ckbox1 = document.createElement("checkbox");
	ckbox1.setAttribute("label", "functional");
	ckbox1.setAttribute("propertyName", "owl:FunctionalProperty");
	ckbox1.addEventListener('command', art_semanticturkey.changeFacets, true);
	ckbox1.setAttribute("checked", "false");
	facetsBox.appendChild(ckbox1);

	var ckbox2 = document.createElement("checkbox");
	ckbox2.setAttribute("label", "inverseFunctional");
	ckbox2.setAttribute("propertyName", "owl:InverseFunctionalProperty");
	ckbox2.addEventListener('command', art_semanticturkey.changeFacets, true);
	ckbox2.setAttribute("checked", "false");
	facetsBox.insertBefore(ckbox2, ckbox1);

	var ckbox3 = document.createElement("checkbox");
	ckbox3.setAttribute("label", "transitive");
	ckbox3.addEventListener('command', art_semanticturkey.changeFacets, true);
	ckbox3.setAttribute("propertyName", "owl:TransitiveProperty");
	ckbox3.setAttribute("checked", "false");
	facetsBox.insertBefore(ckbox3, ckbox2);
	var ckbox4 = document.createElement("checkbox");
	ckbox4.setAttribute("label", "symmetric");
	ckbox4.setAttribute("checked", "false");
	ckbox4.setAttribute("propertyName", "owl:SymmetricProperty");
	ckbox4.addEventListener('command', art_semanticturkey.changeFacets, true);
	facetsBox.insertBefore(ckbox4, ckbox3);
	rowBox.appendChild(facetsBox);
	// InverseOf
	var lbl = document.createElement("label");
	var img = document.createElement("image");
	img.setAttribute("src", "chrome://semantic-turkey/skin/images/prop.png");
	lbl.setAttribute("value", "inverseOf");
	var row = document.createElement("row");
	var box = document.createElement("box");
	row.setAttribute("flex", "0");
	box.appendChild(lbl);
	box.insertBefore(img, lbl);
	var titleBox = document.createElement("box");
	var inversBtn = document.createElement("toolbarbutton");
	inversBtn.setAttribute("image",
			"chrome://semantic-turkey/skin/images/individual_add.png");
	inversBtn.setAttribute("id", "addInverseOf");
	inversBtn
			.addEventListener("command", art_semanticturkey.addInverseOf, true);
	inversBtn.setAttribute("tooltiptext", "Add New Property");
	inversBtn.setAttribute("disabled", "false");
	titleBox.appendChild(inversBtn);
	titleBox.insertBefore(box, inversBtn);
	row.appendChild(titleBox);
	rowBox.appendChild(row);

	if (facetsList.length > 0) {
		for (var i = 0; i < facetsList.length; i++) {
			if (facetsList[i].nodeType == 1
					&& facetsList[i].tagName == "inverseOf") {

				var valueList = facetsList[i].childNodes;
				var inverseValueList = responseElement
						.getElementsByTagName("inverseOf")[0]
						.getElementsByTagName("Value");
				if (inverseValueList.length > 10) {
					var inverseList = document.createElement("listbox");
					inverseList.setAttribute("id", "inverseList");
					inverseList.setAttribute("flex", "1");

					var remInverseBtn = document.createElement("toolbarbutton");
					remInverseBtn
							.setAttribute("image",
									"chrome://semantic-turkey/skin/images/prop_delete.png");
					remInverseBtn.setAttribute("label", "Remove Value");
					remInverseBtn.setAttribute("id", "removeInverseOf");
					remInverseBtn.setAttribute("flex", "0");
					remInverseBtn.addEventListener("command",
							art_semanticturkey.removeInverseOfEvent, true);
					var containerObj = new Object();
					containerObj.value = "list";
					containerObj.isList = "true";
					remInverseBtn.containerObj = containerObj;
					remInverseBtn.setAttribute("tooltiptext",
							"Remove InverseOf value");
					titleBox.insertBefore(remInverseBtn, inversBtn);
					titleBox.insertBefore(inversBtn, remInverseBtn);
					for (var j = 0; j < valueList.length; j++) {
						if (valueList[j].nodeType == 1) {
							var value = valueList[j].getAttribute("value");
							var lsti = document.createElement("listitem");
							var lci = document.createElement("listitem-iconic");
							var img = document.createElement("image");
							img
									.setAttribute("src",
											"chrome://semantic-turkey/skin/images/prop.png");
							lci.appendChild(img);
							var lbl = document.createElement("label");

							lbl.setAttribute("value", value);
							lci.appendChild(lbl);
							lsti.setAttribute("label", value);
							var explicit = valueList[j]
									.getAttribute("explicit");
							lsti.setAttribute("explicit", explicit);
							lsti.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							lsti.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							lsti.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObjTx = new Object();
							containerObjTx.explicit = explicit;
							containerObjTx.sourceElementName = value;
							containerObjTx.sourceType = window.arguments[0].sourceType;
							lsti.containerObj = containerObjTx;
							lsti.appendChild(lci);
							inverseList.appendChild(lsti);
						}
					}
					var rowInv = document.createElement("row");
					rowInv.appendChild(inverseList);
					rowsBox.appendChild(rowInv);
				} else {
					for (k = 0; k < valueList.length; k++) {
						if (valueList[k].nodeType == 1) {
							var value = valueList[k].getAttribute("value");
							var inverseTxbox = document
									.createElement("textbox");
							inverseTxbox.setAttribute("id", "inverseOf");
							inverseTxbox.setAttribute("value", value);
							inverseTxbox.setAttribute("flex", "1");
							inverseTxbox.setAttribute("readonly", "true");
							inverseTxbox.addEventListener("dblclick",
									art_semanticturkey.resourcedblClickEvent,
									true);
							inverseTxbox.addEventListener("mouseover",
									art_semanticturkey.setCursorPointerEvent,
									true);
							inverseTxbox.addEventListener("mouseout",
									art_semanticturkey.setCursorDefaultEvent,
									true);

							var containerObjTx = new Object();
							containerObjTx.explicit = explicit;
							containerObjTx.sourceElementName = value;
							containerObjTx.sourceType = window.arguments[0].sourceType;
							inverseTxbox.containerObj = containerObjTx;
							inversBtn = document.getElementById("addInverseOf");
							var inverseBox = document.createElement("box");
							inverseBox.setAttribute("flex", "1");
							// NScarpato 15/09/2008 added remove inverseOf
							// value Button
							remInverseBtn = document.createElement("button");
							remInverseBtn
									.setAttribute("image",
											"chrome://semantic-turkey/skin/images/prop_delete.png");
							remInverseBtn.setAttribute("label", "Remove Value");
							remInverseBtn.setAttribute("id", "removeInverseOf");
							remInverseBtn.setAttribute("flex", "0");
							remInverseBtn.addEventListener("command",
									art_semanticturkey.removeInverseOfEvent,
									true);
							var containerObj = new Object();
							containerObj.value = value;
							containerObj.isList = "false";
							remInverseBtn.containerObj = containerObj;
							remInverseBtn.setAttribute("tooltiptext",
									"Remove InverseOf value");
							inverseBox.appendChild(remInverseBtn);
							inverseBox
									.insertBefore(inverseTxbox, remInverseBtn);
							rowBox.appendChild(inverseBox);
						}
					}
				}
			} else if (facetsList[i].tagName == "functional") {
				ckbox1.setAttribute("checked", "true");
			} else if (facetsList[i].tagName == "inverseFunctional") {
				ckbox2.setAttribute("checked", "true");
			} else if (facetsList[i].tagName == "transitive") {
				ckbox3.setAttribute("checked", "true");
			} else if (facetsList[i].tagName == "symmetric") {
				ckbox4.setAttribute("checked", "true");
			}
		}
	}

};

art_semanticturkey.onClose = function() {
	close();
};

/**
 * @author NScarpato 13/03/2008 add Domain for selected property
 */
art_semanticturkey.insertDomain = function() {
	var domainName = "";
	parameters = new Object();
	parameters.source = "domain";
	parameters.domainName = domainName;
	parameters.parentWindow = window.arguments[0].parentWindow;
	window.openDialog(
			"chrome://semantic-turkey/content/editors/class/classTree.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters);
	var domainName = parameters.domainName;
	if (domainName != "none domain selected") {
		try {
			art_semanticturkey.STRequests.Property.addPropertyDomain(document
							.getElementById("name").value, domainName);
			// art_semanticturkey.refreshPanel();
			art_semanticturkey.evtMgr.fireEvent("refreshEditor",
					(new art_semanticturkey.genericEventClass()));
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};
/**
 * insertRange
 * 
 */
art_semanticturkey.insertRange = function() {
	var mytype = window.arguments[0].sourceType;
	var rangeName = "";
	var parameters = new Object();
	if (mytype.indexOf("ObjectProperty") != -1) {
		parameters.source = "range";
		parameters.parentWindow = window.arguments[0].parentWindow;
		parameters.rangeName = rangeName;
		window.openDialog(
				"chrome://semantic-turkey/content/editors/class/classTree.xul",
				"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
				parameters);
		if (parameters.rangeName != "") {
			try {
				art_semanticturkey.STRequests.Property.addPropertyRange(
						document.getElementById("name").value,
						parameters.rangeName);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}

	} else {
		parameters.source = "range";
		parameters.rangeName = rangeName;
		window
				.openDialog(
						"chrome://semantic-turkey/content/editors/property/rangeList.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		if (parameters.rangeName != "") {
			try {
				art_semanticturkey.STRequests.Property.addPropertyRange(
						document.getElementById("name").value,
						parameters.rangeName);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}
	}
	// art_semanticturkey.refreshPanel();
	art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			(new art_semanticturkey.genericEventClass()));
};

art_semanticturkey.removeDomainEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removeDomain(containerObj.domainValue,
			containerObj.isList);
};

/**
 * NScarpato 19/03/2008 removeDomain
 */
art_semanticturkey.removeDomain = function(domainValue, isList) {

	if (isList == "true") {
		var list = document.getElementById("domainsList");
		var selItem = list.selectedItem;
		var domainName = list.selectedItem.getAttribute("label");
		var explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			try {
				art_semanticturkey.STRequests.Property.removePropertyDomain(
						document.getElementById("name").value, domainName);
				// art_semanticturkey.refreshPanel();
				art_semanticturkey.evtMgr.fireEvent("refreshEditor",
						(new art_semanticturkey.genericEventClass()));
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		} else {
			alert("You cannot remove this domain, it's a system resource!");
		}
	} else {
		try {
			art_semanticturkey.STRequests.Property.removePropertyDomain(
					document.getElementById("name").value, domainValue);
			// art_semanticturkey.refreshPanel();
			art_semanticturkey.evtMgr.fireEvent("refreshEditor",
					(new art_semanticturkey.genericEventClass()));
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

art_semanticturkey.removeRangeEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removeRange(containerObj.value, containerObj.isList);
};

/**
 * NScarpato 19/03/2008 removeRange
 */
art_semanticturkey.removeRange = function(value, isList) {
	if (isList == "true") {
		var list = document.getElementById("rangesList");
		var selItem = list.selectedItem;
		var rangeName = list.selectedItem.getAttribute("label");
		var explicit = list.selectedItem.getAttribute("explicit");
		if (explicit == "true") {
			try {
				art_semanticturkey.STRequests.Property.removePropertyRange(
						document.getElementById("name").value, rangeName);
				// art_semanticturkey.refreshPanel();
				art_semanticturkey.evtMgr.fireEvent("refreshEditor",
						(new art_semanticturkey.genericEventClass()));
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		} else {
			alert("You cannot remove this range, it's a system resource");
		}
	} else {
		try {
			art_semanticturkey.STRequests.Property.removePropertyRange(document
							.getElementById("name").value, value);
			// art_semanticturkey.refreshPanel();
			art_semanticturkey.evtMgr.fireEvent("refreshEditor",
					(new art_semanticturkey.genericEventClass()));
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

art_semanticturkey.addTypeEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.addType(containerObj.type);
};

/**
 * NScarpato addType
 */
art_semanticturkey.addType = function(addtype) {
	var parameters2 = new Object();
	parameters2.source = "editorIndividual";
	var selectedClass = "";
	parameters2.selectedClass = selectedClass;
	parameters2.parentWindow = window.arguments[0].parentWindow;
	window.openDialog(
			"chrome://semantic-turkey/content/editors/class/classTree.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters2);
	var responseXML;
	if (parameters2.selectedClass != "") {
		try {
			if (addtype == "individual") {
				responseXML = art_semanticturkey.STRequests.Individual.addType(
						document.getElementById("name")
								.getAttribute("actualValue"),
						parameters2.selectedClass);
			} else {
				responseXML = art_semanticturkey.STRequests.Cls.addType(
						document.getElementById("name")
								.getAttribute("actualValue"),
						parameters2.selectedClass);
			}
			// art_semanticturkey.refreshPanel();
			//art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			//		(new art_semanticturkey.genericEventClass()));
			var instancaId = document.getElementById("name").getAttribute("actualValue");
			var explicit = true;
			var instanceType = window.arguments[0].sourceType;
			art_semanticturkey.evtMgr.fireEvent("addedType", 
					(new art_semanticturkey.typeAddedClass(instancaId, parameters2.selectedClass, explicit, instanceType)));
			// document.getElementById("editorPanel").setAttribute("changed",
			// "true");
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

art_semanticturkey.removeTypeEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removeType(containerObj.value, containerObj.sourceType,
			containerObj.isList);
};

/**
 * NScarpato 26/11/2007 Remove Type
 */
art_semanticturkey.removeType = function(value, sourceType, isList) {
	var explicit = "true";
	var responseXML;
	if (isList) {
		var list = document.getElementById("typesList");
		var selItem = list.selectedItem;
		value = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
	}
	if (explicit == "true") {
		try {
			if (sourceType == "individual") {
				responseXML = art_semanticturkey.STRequests.Individual
						.removeType(document.getElementById("name")
										.getAttribute("actualValue"), value);
			} else {
				responseXML = art_semanticturkey.STRequests.Cls.removeType(
						document.getElementById("name")
								.getAttribute("actualValue"), value);
			}
			// art_semanticturkey.refreshPanel();
			//art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			//		(new art_semanticturkey.genericEventClass()));
			var instancaId = document.getElementById("name").getAttribute("actualValue");
			art_semanticturkey.evtMgr.fireEvent("removedType",
					(new art_semanticturkey.typeRemovedClass(instancaId, value)));
			// document.getElementById("editorPanel").setAttribute("changed",
			// "true");
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		alert("You cannot remove this type, it's a system resource!");
	}

};

/**
 * NScarpato 05/12/2007 addSuperClass
 */
art_semanticturkey.addSuperClass = function(addSCtype) {
	var responseElement;
	var className;
	if (addSCtype == "list") {
		var parameters2 = new Object();
		parameters2.source = "editorClass";
		var lsti = document.createElement("listitem");
		var selectedClass = "";
		parameters2.selectedClass = selectedClass;
		parameters2.parentWindow = window.arguments[0].parentWindow;
		window.openDialog(
				"chrome://semantic-turkey/content/editors/class/classTree.xul",
				"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
				parameters2);
		try {
			className = document.getElementById("name")
					.getAttribute("actualValue")
			responseElement = art_semanticturkey.STRequests.Cls.addSuperCls(
					className, parameters2.selectedClass);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		var parameters2 = new Object();
		parameters2.source = "editorClass";
		var txbox = document.createElement("textbox");
		var selectedClass = "";
		txbox.setAttribute("readonly", "true");
		parameters2.selectedClass = selectedClass;
		parameters2.parentWindow = window.arguments[0].parentWindow;
		window.openDialog(
				"chrome://semantic-turkey/content/editors/class/classTree.xul",
				"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
				parameters2);
		if (parameters2.selectedClass != "") {
			txbox.setAttribute("value", selectedClass);
			try {
				className = document.getElementById("name")
						.getAttribute("actualValue");
				responseElement = art_semanticturkey.STRequests.Cls
						.addSuperCls(className, parameters2.selectedClass);
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}
	}
	// art_semanticturkey.refreshPanel();
	art_semanticturkey.addSuperClass_RESPONSE(className, responseElement);
};

art_semanticturkey.addSuperClass_RESPONSE = function(className, responseElement) {
	var resourceNode = responseElement.getElementsByTagName('Type')[0];
	var className = className;
	var superClassName = resourceNode.getAttribute("qname");
	art_semanticturkey.evtMgr.fireEvent("subClsOfAddedClass",
			(new art_semanticturkey.subClsOfAddedClass(className,
					superClassName)));
};

art_semanticturkey.removeSuperClassEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey
			.removeSuperClass(containerObj.value, containerObj.isList);
};

/**
 * NScarpato 05/12/2007 Remove Super Class
 */
art_semanticturkey.removeSuperClass = function(value, isList) {
	var explicit = "true";
	var responseElement;
	var className;
	var value = value;
	if (isList) {
		var list = document.getElementById("superTypesList");
		var selItem = list.selectedItem;
		value = list.selectedItem.getAttribute("label");
		explicit = list.selectedItem.getAttribute("explicit");
	}
	if (explicit == "true") {
		try {
			className = document.getElementById("name")
					.getAttribute("actualValue");
			responseElement = art_semanticturkey.STRequests.Cls.removeSuperCls(
					className, value);
			// art_semanticturkey.refreshPanel();
			art_semanticturkey.removeSuperClass_RESPONSE(className,
					responseElement);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	} else {
		alert("You cannot remove this type, it's a system resource!");
	}
};

art_semanticturkey.removeSuperClass_RESPONSE = function(className,
		responseElement) {
	var resourceNode = responseElement.getElementsByTagName('Type')[0];
	var className = className;
	var superClassName = resourceNode.getAttribute("qname");
	art_semanticturkey.evtMgr.fireEvent("subClsOfRemovedClass",
			(new art_semanticturkey.subClsOfRemovedClass(className,
					superClassName)));
};

art_semanticturkey.createAndAddPropValueEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.createAndAddPropValue(containerObj.propertyQName,
			containerObj.typeValue, containerObj.isLiteral);
};

/**
 * @author NScarpato 10/03/2008 createAndAddPropValue
 * @param {String}
 *            property name
 */
art_semanticturkey.createAndAddPropValue = function(propertyQName, typeValue,
		isLiteral) {
	var instanceQName = document.getElementById("name")
			.getAttribute("actualValue");
	var parameters = new Object();
	parameters.predicatePropertyName = propertyQName;
	parameters.winTitle = "Add Property Value";
	parameters.action = "createAndAddPropValue";
	parameters.sourceElementName = instanceQName;
	parameters.parentBox = document.getElementById("parentBoxRows");;
	parameters.rowBox = document.getElementById("rowsBox");
	parameters.typeValue = typeValue;
	parameters.parentWindow = window.arguments[0].parentWindow;
	parameters.oncancel = false;
	parameters.skos = window.arguments[0].skos;
	
	// NScarpato 20/11/2010
	var responseXML = art_semanticturkey.STRequests.Property.getRange(
			propertyQName, "false");
	var ranges = responseXML.getElementsByTagName("ranges")[0];
		
	if (ranges.getAttribute("rngType").indexOf("resource") != -1) {
		window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);

	} else if (ranges.getAttribute("rngType").indexOf("plainLiteral") != -1) {
		window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichPlainLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
	} else if (ranges.getAttribute("rngType").indexOf("typedLiteral") != -1) {
		var rangeList = ranges.childNodes;
		for (var i = 0; i < rangeList.length; ++i) {
			if (typeof(rangeList[i].tagName) != 'undefined') {

				parameters.rangeType = rangeList[i].textContent;
			}
		}
		window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichTypedLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
	} else if (ranges.getAttribute("rngType").indexOf("literal") != -1) {
		var rangeList = ranges.childNodes;
		var role=null;
		if(rangeList.length > 0){
			for (var i = 0; i < rangeList.length; ++i) {
				if (typeof(rangeList[i].tagName) != 'undefined') {
					var dataRangeBNodeID = rangeList[i].textContent;
					var role=rangeList[i].getAttribute("role");
					var nodeType=rangeList[i].tagName;
				}
			}
			if(role.indexOf("dataRange")!= -1){
				var responseXML = art_semanticturkey.STRequests.Property.parseDataRange(dataRangeBNodeID,nodeType);
				
				var dataElement = responseXML.getElementsByTagName("data")[0];
				var dataRangesList = dataElement.childNodes;
				var dataRangesValueList = new Array();
				var k=0;
				for (var i = 0; i < dataRangesList.length; ++i) {
					if (typeof(dataRangesList[i].tagName) != 'undefined') {
						var dataRangeValue = new Object(); 
						dataRangeValue.type = dataRangesList[i].tagName;
						dataRangeValue.rangeType = dataRangesList[i].getAttribute("type");
						dataRangeValue.show= dataRangesList[i].getAttribute("show");
						dataRangesValueList[k]=dataRangeValue;
						k++;
					}
				}
				parameters.rangeType = "dataRange";
				parameters.dataRangesValueList=dataRangesValueList;
				window
						.openDialog(
								"chrome://semantic-turkey/content/enrichProperty/enrichTypedLiteralRangedProperty.xul",
								"_blank", "modal=yes,resizable,centerscreen",
								parameters);
			}
	} else{
		var literalsParameters = new Object();
		literalsParameters.isLiteral = "literal";
		window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/isLiteral.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						literalsParameters);
		if(literalsParameters.isLiteral == "plainLiteral"){
			window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichPlainLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		}else if(literalsParameters.isLiteral == "typedLiteral"){
			window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichTypedLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		}
	}
	} else  if (ranges.getAttribute("rngType").indexOf("undetermined") != -1) {
		var literalsParameters = new Object();
		literalsParameters.isLiteral = "undetermined";
		window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/isLiteral.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						literalsParameters);
		if(literalsParameters.isLiteral == "plainLiteral"){
			window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichPlainLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		}else if(literalsParameters.isLiteral == "typedLiteral"){
			var rangeList = ranges.childNodes;
			for (var i = 0; i < rangeList.length; ++i) {
				if (typeof(rangeList[i].tagName) != 'undefined') {
					parameters.rangeType = rangeList[i].textContent;
				}
			}
			window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichTypedLiteralRangedProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		}else if(literalsParameters.isLiteral == "resource"){
			window
				.openDialog(
						"chrome://semantic-turkey/content/enrichProperty/enrichProperty.xul",
						"_blank", "modal=yes,resizable,centerscreen",
						parameters);
		}				
	} else if (ranges.getAttribute("rngType").indexOf("inconsistent") != -1) {
		alert("Error range of "+propertyQName+" property is inconsistent");
	}

	if (parameters.oncancel == false) {
		if (window.arguments[0].sourceType == "skosConcept") {
			// Luca Mastrogiovanni: fire event propertyValueAdded
			var obj = new Object();
			art_semanticturkey.evtMgr.fireEvent("propertyValueAdded", obj);

		}
		// art_semanticturkey.refreshPanel();
		art_semanticturkey.evtMgr.fireEvent("refreshEditor",
				(new art_semanticturkey.genericEventClass()));
	}
};

art_semanticturkey.removePropValueEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removePropValue(containerObj.value,
			containerObj.nameValue, containerObj.typeValue,
			containerObj.valueType,containerObj.rangeQName);
};

/**
 * @author NScarpato 10/03/2008 removePropValue
 * @param {String}
 *            value: it's 'list' or value of textBox
 */
art_semanticturkey.removePropValue = function(value, propertyQName, typeValue,
		type,rangeQName) {
	var instanceQName = document.getElementById("name")
			.getAttribute("actualValue");
	// NScarpato 25/11/2010
	var responseXML = art_semanticturkey.STRequests.Property.getRange(
			propertyQName, "false");
	var ranges = responseXML.getElementsByTagName("ranges")[0];
	var rangeList = ranges.childNodes;
	//NScarpato 29/11/2010

	/*if(type == "dataRange"){
			for (var i = 0; i < rangeList.length; ++i) {
				if (typeof(rangeList[i].tagName) != 'undefined') {
					var dataRangeBNodeID = rangeList[i].textContent;
				}
			}
			var responseXML = art_semanticturkey.STRequests.Property.parseDataRange(dataRangeBNodeID,"bnode");
			var dataElement = responseXML.getElementsByTagName("data")[0];
			var dataRangesList = dataElement.childNodes;
			for (var i = 0; i < dataRangesList.length; ++i) {
				if (typeof(dataRangesList[i].tagName) != 'undefined') {
					if(value == dataRangesList[i].getAttribute("show")){
						type = dataRangesList[i].tagName;
						break;
					}
				}
			}
	}else{
		for (var i = 0; i < rangeList.length; ++i) {
				if (typeof(rangeList[i].tagName) != 'undefined') {
	
					//var type =  rangeList[i].textContent;
					type =  rangeList[i].tagName;
				}
		}
	}*/
	try {
		if (value == "list") {
			var list = document.getElementById(propertyQName);
			var selItem = list.selectedItem;
			var type = selItem.getAttribute("type");
			var propValue = list.selectedItem.getAttribute("label");
			var explicit = list.selectedItem.getAttribute("explicit");
			if (explicit == "true") {
				
				if (type.indexOf("plainLiteral") != -1) {
					lang = list.selectedItem.getAttribute("language");
					art_semanticturkey.STRequests.Property
							.removePropValue(instanceQName, propertyQName,
									propValue,rangeQName, type, lang);
				} else {
					art_semanticturkey.STRequests.Property.removePropValue(
							instanceQName, propertyQName, propValue,rangeQName, type);
				}
			} else {
				alert("You cannot remove this property value, it's a system resource!");
			}
		} else {
			
			if (type.indexOf("plainLiteral") != -1) {
				var lang = document.getElementById(value).getAttribute("language");
				art_semanticturkey.STRequests.Property.removePropValue(
						instanceQName, propertyQName, value,rangeQName, type, lang);
			} else {
				art_semanticturkey.STRequests.Property.removePropValue(
						instanceQName, propertyQName, value,rangeQName, type);
			}
		}

		// Luca Mastrogiovanni: fire event propertyRemoved
		var obj = new Object();
		// art_semanticturkey.evtMgr.fireEvent("propertyRemoved", obj);
		// art_semanticturkey.refreshPanel();
		art_semanticturkey.evtMgr.fireEvent("refreshEditor",
				(new art_semanticturkey.genericEventClass()));
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};
/**
 * @author NScarpato 12/03/2008 rename 14/03/2008 change function to make also
 *         refresh of instance list and property tree
 */
art_semanticturkey.rename = function() {
	var deleteForbidden = window.arguments[0].deleteForbidden;
	var textbox = document.getElementById("name");
	var elname = textbox.getAttribute("actualValue");
	var newName = textbox.value;
	if (window.arguments[0].sourceType == "cls") {
		if (deleteForbidden == "true") {
			alert("You cannot rename this class, it's a system resource!");
			textbox.value = elname.substring(0, elname.indexOf('('));
		} else {
			if (elname.indexOf('(') > -1) {
				elname = elname.substring(0, elname.indexOf('('));
			}

		}
	} else if (window.arguments[0].sourceType == "individual") {
		if (deleteForbidden == "true") {
			alert("You cannot rename this istance, it's a system resource!");
			textbox.value = elname;
		}
	} else {
		if (deleteForbidden == "true") {
			alert("You cannot rename this property, it's a system resource!");
			textbox.value = elname;
		}
	}
	if (deleteForbidden != "true") {
		try {
			var responseXML = art_semanticturkey.STRequests.ModifyName.rename(
					elname, newName);
			art_semanticturkey.rename_RESPONSE(responseXML);
			document.getElementById("name")
					.setAttribute("actualValue", newName);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
	textbox.style.color = "black";
};

art_semanticturkey.rename_RESPONSE = function(responseElement) {
	var resourceNode = responseElement.getElementsByTagName('UpdateResource')[0];
	var iconicName = resourceNode.getAttribute("name");
	var newName = resourceNode.getAttribute("newname");
	if (window.arguments[0].sourceType == "cls") {
		var resourceElement = responseElement
				.getElementsByTagName('UpdateResource')[0];
		var newClassName = resourceElement.getAttribute("newname");
		var oldClassName = resourceElement.getAttribute("name");
		document.getElementById("name").setAttribute("actualValue",
				newClassName);
		art_semanticturkey.evtMgr.fireEvent("renamedClass",
				(new art_semanticturkey.classRenamedClass(newClassName,
						oldClassName)));
	} else if (window.arguments[0].sourceType == "individual") {
		var oldIndividualName = iconicName;
		var newIndividualName = newName;
		/*var list = window.arguments[0].list;
		var listItemList = list.getElementsByTagName("listitem");
		for (var i = 0; i < listItemList.length; i++) {
			if (listItemList[i].getAttribute("label") == iconicName) {
				listItemList[i].setAttribute("label", newName);
				var listItIc = listItemList[i]
						.getElementsByTagName("listitem-iconic");
				listItIc[0].getElementsByTagName("label")[0].setAttribute(
						"value", newName);
			}
		}*/
		art_semanticturkey.evtMgr.fireEvent("renamedIndividual",
				(new art_semanticturkey.individualRenamedIndividual(newIndividualName,
						oldIndividualName)));
	} else {
		// TODO add event for rename of property (and other stuff)
		var tree = window.arguments[0].tree;
		
		if (typeof tree == "undefined") return;
		
		var treecellNodes = tree.getElementsByTagName("treecell");
		for (var i = 0; i < treecellNodes.length; i++) {
			if (treecellNodes[i].getAttribute("label") == iconicName) {
				treecellNodes[i].setAttribute("label", newName);
			}
		}
	}
};
/**
 * @author NScarpato 18/03/2008 refreshPanel
 * 
 */
art_semanticturkey.refreshPanel = function() {
	var sourceElementName = document.getElementById("name").value;
	var mytype = window.arguments[0].sourceType;
	// empty parentBox
	var parentBox = document.getElementById("parentBoxRows");
	while (parentBox.hasChildNodes()) {
		parentBox.removeChild(parentBox.lastChild);
	}
	// empty rowBox
	rowBox = document.getElementById("rowsBox");
	while (rowBox.hasChildNodes()) {
		rowBox.removeChild(rowBox.lastChild);
	}
	var responseXML;
	try {
		if (mytype == "cls") {
			responseXML = art_semanticturkey.STRequests.Cls
					.getClassDescription(sourceElementName, "templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else if (mytype == "individual") {
			responseXML = art_semanticturkey.STRequests.Individual
					.getIndividualDescription(sourceElementName,
							"templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else if (mytype == "Ontology") {
			responseXML = art_semanticturkey.STRequests.Metadata
					.getOntologyDescription();
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else if (mytype == "concept") {
			responseXML = art_semanticturkey.STRequests.SKOS.getConceptDescription(sourceElementName, "templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else if (mytype == "conceptScheme") {
			responseXML = art_semanticturkey.STRequests.SKOS.getConceptSchemeDescription(sourceElementName, "templateandvalued");
			art_semanticturkey.getResourceDescription_RESPONSE(responseXML);
		} else{ // Property
			responseXML = art_semanticturkey.STRequests.Property
					.getPropertyDescription(sourceElementName);
			art_semanticturkey.getPropertyDescription_RESPONSE(responseXML);
		}
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

/**
 * @author NScarpato 26/03/2008 AddNewProperty
 */
art_semanticturkey.addNewProperty = function() {
	var parameters = new Object();
	var selectedProp = "";
	var selectedPropType = "";
	parameters.selectedProp = selectedProp;
	parameters.selectedPropType = selectedPropType;
	parameters.oncancel = false;
	parameters.source = "AddNewProperty";
	parameters.type = "All";
	window
			.openDialog(
					"chrome://semantic-turkey/content/editors/property/propertyTree.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
	var propType = parameters.selectedPropType;
	if (parameters.oncancel == false) {
		//NScarpato 25/11/2010
		/*if (propType.indexOf("rdf:Property") != -1) {
			var literalsParameters = new Object();
			literalsParameters.isLiteral = "none";
			var type = "none";
			window
					.openDialog(
							"chrome://semantic-turkey/content/enrichProperty/isLiteral.xul",
							"_blank", "modal=yes,resizable,centerscreen",
							literalsParameters);
			if (literalsParameters.isLiteral != "none") {
				art_semanticturkey.createAndAddPropValue(
						parameters.selectedProp, propType,
						literalsParameters.isLiteral);
			}
		} else {*/
			art_semanticturkey.createAndAddPropValue(parameters.selectedProp,
					propType);
		//}
	}
};
/**
 * @author NScarpato 27/03/2008 changeFacets
 */
art_semanticturkey.changeFacets = function(event) {
	var check = event.target.getAttribute("checked");
	var sourceElementName = document.getElementById("name")
			.getAttribute("actualValue");
	// NScarpato 25/11/2010
	var responseXML = art_semanticturkey.STRequests.Property.getRange(
			"rdf:type", "false");
	var ranges = responseXML.getElementsByTagName("ranges")[0];
	var type = (ranges.getAttribute("rngType"));		
	try {
		if (check) {
			art_semanticturkey.STRequests.Property.addExistingPropValue(
					sourceElementName, "rdf:type", event.target
							.getAttribute("propertyName"),type);
		} else {
			art_semanticturkey.STRequests.Property.removePropValue(
					sourceElementName, "rdf:type", event.target
							.getAttribute("propertyName"),null,type);
		}
		// art_semanticturkey.refreshPanel();
		art_semanticturkey.evtMgr.fireEvent("refreshEditor",
				(new art_semanticturkey.genericEventClass()));
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};
/**
 * @author NScarpato 03/04/2008 AddInverseOf
 */
art_semanticturkey.addInverseOf = function() {
	var mytype = window.arguments[0].sourceType;
	var sourceElementName = document.getElementById("name")
			.getAttribute("actualValue");
	var parameters = new Object();
	var selectedProp = "";
	var selectedPropType = "";
	var responseXML = art_semanticturkey.STRequests.Property.getRange(
			"owl:inverseOf", "false");
	var ranges = responseXML.getElementsByTagName("ranges")[0];
	var type = (ranges.getAttribute("rngType"));
	parameters.selectedProp = selectedProp;
	parameters.selectedPropType = selectedPropType;
	parameters.oncancel = false;
	parameters.type = type;
	window
			.openDialog(
					"chrome://semantic-turkey/content/editors/property/propertyTree.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
	if (parameters.oncancel == false) {
		try {
			art_semanticturkey.STRequests.Property
					.addExistingPropValue(sourceElementName, "owl:inverseOf",
							parameters.selectedProp,type);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
	// art_semanticturkey.refreshPanel();
	art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			(new art_semanticturkey.genericEventClass()));
};

art_semanticturkey.removeInverseOfEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removeInverseOf(containerObj.value, containerObj.isList);
};

/**
 * @author NScarpato 15/09/2008 RemoveInverseOf
 */
art_semanticturkey.removeInverseOf = function(value, isList) {
	if (isList == "true") {
		var list = document.getElementById("inverseList");
		value = list.selectedItem.getAttribute("label");
	}
	var sourceElementName = document.getElementById("name")
			.getAttribute("actualValue");
	var responseXML = art_semanticturkey.STRequests.Property.getRange(
			"owl:inverseOf", "false");
	var ranges = responseXML.getElementsByTagName("ranges")[0];
	var type = (ranges.getAttribute("rngType"));
	try {
		art_semanticturkey.STRequests.Property.removePropValue(
				sourceElementName, "owl:inverseOf", value,null,type);
		// art_semanticturkey.refreshPanel();
		art_semanticturkey.evtMgr.fireEvent("refreshEditor",
				(new art_semanticturkey.genericEventClass()));
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

/**
 * NScarpato 23/06/2008 addSuperProperty
 */
art_semanticturkey.addSuperProperty = function() {
	var mytype = window.arguments[0].sourceType;
	var parameters = new Object();
	parameters.selectedProp = "";
	parameters.selectedPropType = "";
	parameters.type = mytype;
	window
			.openDialog(
					"chrome://semantic-turkey/content/editors/property/propertyTree.xul",
					"_blank", "modal=yes,resizable,centerscreen", parameters);
	if (parameters.selectedProp != "") {
		try {
			art_semanticturkey.STRequests.Property.addSuperProperty(document
							.getElementById("name").value,
					parameters.selectedProp);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
	// art_semanticturkey.refreshPanel();
	art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			(new art_semanticturkey.genericEventClass()));
};

art_semanticturkey.removeSuperPropertyEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.removeSuperProperty(containerObj.superPropValue);
};

/**
 * NScarpato 23/06/2008 Remove Super Property
 */
art_semanticturkey.removeSuperProperty = function(superPropValue) {
	// parameters = new Object();
	var mytype = window.arguments[0].sourceType;
	try {
		if (superPropValue == "list") {
			var list = document.getElementById("superTypesList");
			var selItem = list.selectedItem;
			var superPropQName = list.selectedItem.getAttribute("label");
			var explicit = list.selectedItem.getAttribute("explicit");
			if (explicit == "true") {
				art_semanticturkey.STRequests.Property.removeSuperProperty(
						document.getElementById("name").value, superPropQName);
			} else {
				alert("You cannot remove this superProperty");
			}
		} else {
			art_semanticturkey.STRequests.Property.removeSuperProperty(document
							.getElementById("name").value, superPropValue);
		}
		// art_semanticturkey.refreshPanel();
		art_semanticturkey.evtMgr.fireEvent("refreshEditor",
				(new art_semanticturkey.genericEventClass()));
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.resourcedblClickEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.resourcedblClick(containerObj.explicit,
			containerObj.sourceElementName, containerObj.sourceType);
};

/** NScarpato 10/07/2008 */
art_semanticturkey.resourcedblClick = function(explicit, sourceElementName,
		sourceType) {
	art_semanticturkey.Logger.debug("explicit = " + explicit
			+ "\nsourceElementName= " + sourceElementName + "\nsourceType = "
			+ sourceType); // da cancellare
	var parameters = new Object();
	parameters.sourceType = sourceType;
	parameters.explicit = explicit;
	parameters.sourceElement = "undefined";
	parameters.sourceElementName = sourceElementName;
	parameters.parentWindow = window;
	parameters.isFirstEditor = false;
	window.openDialog(
			"chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,left=400,top=100", 
			parameters);
	// art_semanticturkey.refreshPanel();
	art_semanticturkey.evtMgr.fireEvent("refreshEditor",
			(new art_semanticturkey.genericEventClass()));
};

art_semanticturkey.openUrlEvent = function(event) {
	var containerObj = event.target.containerObj;
	art_semanticturkey.openUrl(containerObj.value);
};

art_semanticturkey.setCursorPointerEvent = function(event) {
	setCursor('pointer');
};

art_semanticturkey.setCursorDefaultEvent = function(event) {
	setCursor('default');
};

art_semanticturkey.setTextBluEvent = function(event) {
	event.target.style.color = 'blue';
};

art_semanticturkey.copyWebLink = function(event) {
	var element = document.popupNode;
	
	var url = element.getAttribute("href");
	
    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].  
    getService(Components.interfaces.nsIClipboardHelper);  
    gClipboardHelper.copyString(url);  
};

art_semanticturkey.addBroaderConceptEvent = function(event) {
	art_semanticturkey.addBroaderConcept();
};

art_semanticturkey.removeBroaderConceptEvent = function(event) {
	var containerObj = event.target.containerObj;
	
	if (containerObj.isList) {
		var list = document.getElementById("superTypesList");
		var selItem = list.selectedItem;
		
		if (selItem == null) {
			alert("Please select a broader concept");
			return;
		}
		
		var broaderConcept = selItem.getAttribute("label");
		
		art_semanticturkey.removeBroaderConcept(broaderConcept);
	} else {
		var broaderConcept = containerObj.value;
		
		art_semanticturkey.removeBroaderConcept(broaderConcept);
		
	}
};

art_semanticturkey.addTopConceptEvent = function(event) {
	art_semanticturkey.addTopConcept();
};

art_semanticturkey.removeTopConceptEvent = function(event) {
	var containerObj = event.target.containerObj;
	
	if (containerObj.isList) {
		var list = document.getElementById("topConceptsList");
		var selItem = list.selectedItem;
		
		if (selItem == null) {
			alert("Please select a top concept");
			return;
		}
		
		var topConcept = selItem.containerObj.sourceElementName;
		
		art_semanticturkey.removeTopConcept(topConcept);
	} else {
		alert("Unsupported: top concept should be represented as a list");
	}
};

art_semanticturkey.addBroaderConcept = function() {
	var parameters = {};
	parameters.conceptScheme = art_semanticturkey.getConceptScheme();
	parameters.parentWindow = window.arguments[0].parentWindow;
	window.openDialog("chrome://semantic-turkey/content/skos/editors/concept/conceptTree.xul", 
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters);
	
	if (typeof parameters.out == "undefined" || typeof parameters.out.selectedConcept == "undefined") return;
	
	try {
		conceptName = document.getElementById("name").getAttribute("actualValue");
		responseElement = art_semanticturkey.STRequests.SKOS.addBroaderConcept(conceptName, parameters.out.selectedConcept);
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.removeBroaderConcept = function(broaderConcept) {
	alert("Remove broader concept: " + broaderConcept);
};

art_semanticturkey.addTopConcept = function() {
	var parameters = {};
	parameters.conceptScheme = art_semanticturkey.getConceptScheme();
	parameters.parentWindow = window.arguments[0].parentWindow;
	window.openDialog("chrome://semantic-turkey/content/skos/editors/concept/conceptTree.xul", 
			"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
			parameters);
	
	if (typeof parameters.out == "undefined" || typeof parameters.out.selectedConcept == "undefined") return;

	alert("Add top concept: " + parameters.out.selectedConcept);
};

art_semanticturkey.removeTopConcept = function(topConcept) {
	alert("Remove top concept:" + topConcept);
};

art_semanticturkey.getConceptScheme = function() {
	var parameters = window.arguments[0];
	
	if (typeof parameters.skos == "undefined") {
		return "*";
	} else {
		if (typeof parameters.skos.selectedScheme == "undefined") {
			return "*";
		} else {
			return parameters.skos.selectedScheme;
		}
	}
};

art_semanticturkey.parsingTopConcepts = function(responseElement, request) {
	var parentBox = document.getElementById("parentBoxRows");
	
	var separator = document.createElement("separator");
	separator.setAttribute("class", "groove");
	separator.setAttribute("orient", "orizontal");
	parentBox.appendChild(separator);

	var topConcepts = responseElement.getElementsByTagName('topConcepts');
	var topConceptList = topConcepts[0].getElementsByTagName('uri');
	
	var topConceptsToolbox = document.createElement("toolbox");
	var topConceptsToolbar = document.createElement("toolbar");
	topConceptsToolbox.appendChild(topConceptsToolbar);
	
	var addTopConcept = document.createElement("toolbarbutton");
	addTopConcept.setAttribute("tooltiptext", "Add Top Concept");
	addTopConcept.setAttribute("image", "chrome://semantic-turkey/skin/images/skosC_create.png");
	addTopConcept.addEventListener("click", art_semanticturkey.addTopConceptEvent, true);

	var containerObj = {};
	containerObj.isList = true;
	
	addTopConcept.containerObj = containerObj;

	
	topConceptsToolbar.appendChild(addTopConcept);
	parentBox.appendChild(topConceptsToolbar);
	
	var removeTopConcept = document.createElement("toolbarbutton");
	removeTopConcept.setAttribute("tooltiptext", "Remove Top Concept");
	removeTopConcept.setAttribute("image", "chrome://semantic-turkey/skin/images/skosC_delete.png");
	removeTopConcept.addEventListener("click", art_semanticturkey.removeTopConceptEvent, true);
	
	var containerObj2 = {};
	containerObj2.isList = true;
	
	removeTopConcept.containerObj = containerObj2;
	
	topConceptsToolbar.appendChild(removeTopConcept);
	parentBox.appendChild(topConceptsToolbar);
	
	var list = document.createElement("listbox");
	list.setAttribute("id", "topConceptsList");
	list.setAttribute("flex", "1");
	var listhead = document.createElement("listhead");
	var listheader = document.createElement("listheader");
	var listitem_iconic = document.createElement("listitem-iconic");

	var lbl2 = document.createElement("label");
	lbl2.setAttribute("value", "Top Concepts:");
	listitem_iconic.appendChild(lbl2);
	listheader.appendChild(listitem_iconic);
	listhead.appendChild(listheader);
	list.appendChild(listhead);
	parentBox.appendChild(list);
	
	for (var i = 0 ; i < topConceptList.length ; i++) {
		var conceptName = topConceptList[i].textContent;
		
		var lsti = document.createElement("listitem");
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		img.setAttribute("src",
				"chrome://semantic-turkey/skin/images/skosConcept20x20.png");
		lci.appendChild(img);

		var lbl = document.createElement("label");
		lbl.setAttribute("value", topConceptList[i].textContent.trim());
		lci.appendChild(lbl);
		
		lsti.appendChild(lci);
				
		var containerObjTx = {};
		containerObjTx.explicit = "true";
		containerObjTx.sourceElementName = conceptName;
		containerObjTx.sourceType = "concept";
		
		lsti.containerObj = containerObjTx;
		
		lsti.addEventListener("dblclick",
				art_semanticturkey.resourcedblClickEvent, true);
		lsti.addEventListener("mouseover",
				art_semanticturkey.setCursorPointerEvent, true);
		lsti.addEventListener("mouseout",
				art_semanticturkey.setCursorDefaultEvent, true);

		list.appendChild(lsti);
	}
};