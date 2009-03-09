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
var OntologySearch = new Object();

/**
 * funzione che attiva il focus sull'elemento scelto NScarpato 04/04/2008
 */
function onAccept() {
	var mylist = getSearchList();
	sourceElement = mylist.currentItem;
	resName = sourceElement.getAttribute("label");
	resType = sourceElement.getAttribute("resType");
	parameters = new Object();
	parameters.typeName = "none";
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=individual&request=get_directNamedTypes&indqname="
					+ encodeURIComponent(resName), false, parameters);
	var typeName = parameters.typeName;
	if (resType == "annotation") {
		resType = resType + "S";
	}
	var callPanel = getCallPanel();
	searchFocus(resType, resName, callPanel, typeName);
	close();
}

/**
 * NScarpato 27/06/2007 modify for filter property and class or instance
 * NScarpato 04/04/2008 change search panel
 */
function initList(foundList, callPanel) {
	for (var i = 0; i < foundList.length; i++) {
		var type = foundList[i].getAttribute("type");
		var name = foundList[i].getAttribute("name");
		// var typeName = foundList[i].getAttribute("type");
		var myList = getSearchList();
		var lsti = document.createElement("listitem");
		lsti.setAttribute("resType", type);
		lsti.setAttribute("typeName", name);
		lci = document.createElement("listitem-iconic");
		img = document.createElement("image");
		lbl = document.createElement("label");
		if (callPanel == "class") {
			if (type == "owl:Individual") {
				img.setAttribute("src", "images/individual.png");
				name = type + " " + foundList[i].getAttribute("name");
				lsti.setAttribute("label", foundList[i].getAttribute("name"));
				lbl.setAttribute("value", name);
				lci.appendChild(img);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				myList.appendChild(lsti);
			} else if (type == "Class") {
				img.setAttribute("src", "images/class.png");
				name = type + " " + foundList[i].getAttribute("name");
				lsti.setAttribute("label", foundList[i].getAttribute("name"));
				lbl.setAttribute("value", name);
				lci.appendChild(img);
				lci.appendChild(lbl);
				lsti.appendChild(lci);
				myList.appendChild(lsti);
			} else if (type == "annotation") {
				// TODO Mancano le annotation nella ricerca
			}
		} else {
			if (type == "owl:ObjectProperty") {
				img.setAttribute("src", "images/propObject20x20.png");
			} else if (type == "owl:DatatypeProperty") {
				img.setAttribute("src", "images/propDatatype20x20.png");
			} else if (type == "owl:AnnotationProperty") {
				img.setAttribute("src", "images/propAnnotation20x20.png");
			} else {
				img.setAttribute("src", "images/prop.png");
			}
			name = foundList[i].getAttribute("name");
			lsti.setAttribute("label", foundList[i].getAttribute("name"));
			lbl.setAttribute("value", name);
			lci.appendChild(img);
			lci.appendChild(lbl);
			lsti.appendChild(lci);
			myList.appendChild(lsti);
		}
		/*
		 * if(type=="annotation" && callPanel=="class" ){ var instance_name =
		 * foundList[i].getAttribute("instance_name");
		 * lsti.setAttribute("label",foundList[i].getAttribute("name"));
		 * lsti.setAttribute("refInstName",foundList[i].getAttribute("instance_name"));
		 * lbl.setAttribute("value","annotation "); lbl2 =
		 * document.createElement("label"); lbl2.setAttribute("value",name);
		 * lbl2.setAttribute("style","font-style: italic;"); lbl3 =
		 * document.createElement("label"); lbl3.setAttribute("value","
		 * referring to "); img2=document.createElement("image");
		 * img2.setAttribute("src","images/individual.png");
		 * lbl4=document.createElement("label");
		 * lbl4.setAttribute("value",instance_name);
		 * lbl4.setAttribute("style","font-style: italic;");
		 * lci.appendChild(img); lci.appendChild(lbl); lci.appendChild(lbl2);
		 * lci.appendChild(lbl3); lci.appendChild(img2); lci.appendChild(lbl4);
		 * lsti.appendChild(lci); myList.appendChild(lsti); }else
		 * if(type=="Instance"){ var typeName =
		 * foundList[i].getAttribute("name"); if(typeName=="Property" ){
		 * if(callPanel=="property"){ img.setAttribute("src","images/prop.png");
		 * name = typeName+" "+foundList[i].getAttribute("name");
		 * lsti.setAttribute("label",foundList[i].getAttribute("name"));
		 * lbl.setAttribute("value",name); lci.appendChild(img);
		 * lci.appendChild(lbl); lsti.appendChild(lci);
		 * myList.appendChild(lsti); } }else{ if(callPanel=="class"){
		 * img.setAttribute("src","images/individual.png"); name = type+"
		 * "+simList[i].getAttribute("name");
		 * lsti.setAttribute("label",simList[i].getAttribute("name"));
		 * lbl.setAttribute("value",name); lci.appendChild(img);
		 * lci.appendChild(lbl); lsti.appendChild(lci);
		 * myList.appendChild(lsti); } }
		 * 
		 * }else if(callPanel=="class"){
		 * img.setAttribute("src","images/class.png"); name = type+"
		 * "+foundList[i].getAttribute("name");
		 * lsti.setAttribute("label",foundList[i].getAttribute("name"));
		 * lbl.setAttribute("value",name); lci.appendChild(img);
		 * lci.appendChild(lbl); lsti.appendChild(lci);
		 * myList.appendChild(lsti); }
		 */
	}
}
function listdblclick(event) {
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
	window.openDialog("chrome://semantic-turkey/content/editorPanel.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
}

// Nscarpato 05/03/2007 modificata search
OntologySearch.search = function(element) {
	if (element != '') {
		var parameters = new Object();
		parameters.callPanel = "class";
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=ontologySearch&request=searchOntology&inputString="
						+ encodeURIComponent(element) + "&types=clsNInd",
				false, parameters);

	}
};
// NScarpato 13/06/2007 modificata search
OntologySearch.searchProperty = function(element) {
	if (element != '') {
		var parameters = new Object();
		parameters.callPanel = "property";
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=ontologySearch&request=searchOntology&inputString="
						+ encodeURIComponent(element) + "&types=property",
				false, parameters);
	}
};