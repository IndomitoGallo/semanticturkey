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
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

window.onload = function() {
	document.getElementById("selectResult").addEventListener("click",
			art_semanticturkey.selectResult, true);
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onClose, true);
	var foundList = window.arguments[0].foundList;
	art_semanticturkey.initList(foundList);
};

art_semanticturkey.onClose = function() {
	close();
};
/**
 * funzione che attiva il focus sull'elemento scelto NScarpato 04/04/2008
 */
art_semanticturkey.selectResult = function() {
	var parentWindow = window.arguments[0].parentWindow;
	var mylist = document.getElementById("SearchList");
	var sourceElement = mylist.currentItem;
	var resName = sourceElement.getAttribute("label");
	var resType = sourceElement.getAttribute("resType");
	var types = window.arguments[0].types;
	var typeName = "";
	if(resType == "owl:Individual"){
			try {
				var responseXML = parentWindow.art_semanticturkey.STRequests.Individual.get_directNamedTypes(resName);
				typeName = responseXML.getElementsByTagName("Type")[0].getAttribute("qname");
			} catch (e) {
				alert(e.name + ": " + e.message);
			}
		}else if (resType == "annotation") {
			resType = resType + "S";
	}
	
	var myTree="";
	var myList="";
	if (types == "clsNInd") {
			myTree = parentWindow.document.getElementById("classesTree");  
			myList =parentWindow.document.getElementById("IndividualsList");
		}else if (types == "property"){
			myTree =parentWindow.document.getElementById("propertiesTree");
	
		}
	close();	
	
	parentWindow.art_semanticturkey.searchFocus(myTree, myList, resType, resName, typeName);
	
};

/**
 * NScarpato 27/06/2007 modify for filter property and class or instance
 * NScarpato 04/04/2008 change search panel
 */
art_semanticturkey.initList = function(foundList) {
	for (var i = 0; i < foundList.length; i++) {
		var type = foundList[i].getAttribute("type");
		var name = foundList[i].getAttribute("name");
		// var typeName = foundList[i].getAttribute("type");
		var myList = document.getElementById("SearchList"); 
		var lsti = document.createElement("listitem");
		lsti.setAttribute("resType", type);
		lsti.setAttribute("typeName", name);
		var lci = document.createElement("listitem-iconic");
		var img = document.createElement("image");
		var lbl = document.createElement("label");
		if (type == "owl:Individual") {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/individual20x20.png");
			name = type + " " + foundList[i].getAttribute("name");
			lsti.setAttribute("label", foundList[i].getAttribute("name"));
			lbl.setAttribute("value", name);
			lci.appendChild(img);
			lci.appendChild(lbl);
			lsti.appendChild(lci);
			myList.appendChild(lsti);
		} else if (type == "Class") {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/class20x20.png");
			name = type + " " + foundList[i].getAttribute("name");
			lsti.setAttribute("label", foundList[i].getAttribute("name"));
			lbl.setAttribute("value", name);
			lci.appendChild(img);
			lci.appendChild(lbl);
			lsti.appendChild(lci);
			myList.appendChild(lsti);
		} else if (type == "annotation") {
			// TODO Mancano le annotation nella ricerca
		}else if (type == "owl:ObjectProperty") {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/propObject20x20.png");
		} else if (type == "owl:DatatypeProperty") {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/propDatatype20x20.png");
		} else if (type == "owl:AnnotationProperty") {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/propAnnotation20x20.png");
		} else {
			img.setAttribute("src", "chrome://semantic-turkey/skin/images/prop20x20.png");
		}
		var name = foundList[i].getAttribute("name");
		lsti.setAttribute("label", foundList[i].getAttribute("name"));
		lbl.setAttribute("value", name);
		lci.appendChild(img);
		lci.appendChild(lbl);
		lsti.appendChild(lci);
		myList.appendChild(lsti);

	}
};
/*TODO RIPRISTINARE
 * function listdblclick(event) {
	var parameters = new Object();
	if (event.target.getAttribute("typeName") == "Property") {
		parameters.sourceElement = event.target;
		parameters.sourceType = event.target.getAttribute("typeName");
		parameters.sourceElementName = event.target.getAttribute("label");
		parameters.sourceParentElementName = "";
		parameters.list = gettheList();
		parameters.tree = getthetree();
	} else {
		parameters.sourceElement = event.target;
		parameters.sourceType = event.target.getAttribute("resType");
		if (event.target.getAttribute("resType") == "Instance") {
			var callPanel = getCallPanel();
			searchFocus(event.target.getAttribute("resType"), event.target
							.getAttribute("label"), event.target
							.getAttribute("typeName"), "", callPanel);
		}
		parameters.sourceElementName = event.target.getAttribute("label");
		parameters.sourceParentElementName = event.target
				.getAttribute("typeName");
		parameters.list = gettheList();
		parameters.tree = getthetree();
		parameters.domain = "";
		parameters.range = "";
	}
	window.openDialog(
			"chrome://semantic-turkey/content/editors/editorPanel.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
}*/
