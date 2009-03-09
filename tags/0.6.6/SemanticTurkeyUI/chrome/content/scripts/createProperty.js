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
/**
 * NScarpato 16/10/2007 File che contiene le funzioni di Riempimento del
 * Pannello create Property
 */
netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
var ptype = "";
/**
 * Funzione che crea gli elementi di createProperty in base al tipo di import
 * selezionato
 */
function initP(propType) {
	img = document.createElement("image");
	if (propType == "ObjectProperty" || propType == "ObjectProperty_noexpl") {
		img.setAttribute("src", "images/propObject20x20.png");
		ptype = "ObjectProperty";
	} else if (propType == "DatatypeProperty"
			|| propType == "DatatypeProperty_noexpl") {
		img.setAttribute("src", "images/propDatatype20x20.png");
		ptype = "DatatypeProperty";
	} else if (propType == "AnnotationProperty"
			|| propType == "AnnotationProperty_noexpl") {
		img.setAttribute("src", "images/propAnnotation20x20.png");
		ptype = "AnnotationProperty";
	}
	var lbl = document.createElement("label");
	lbl.setAttribute("value", "Create " + ptype + " Form");
	lbl.setAttribute("class", "header");
	var titleBox = getTitle();
	img.setAttribute("flex", "0");
	titleBox.appendChild(img);
	titleBox.appendChild(lbl);
}

function onAccept() {
	var iconicName = window.arguments[0].iconicName;
	var tree = window.arguments[0].tree;
	var parentTreecell = window.arguments[0].parentTreecell;
	var typeP = window.arguments[0].type;
	var textboxName = document.getElementById("name");
	parameters = new Object();
	parameters.iconicName = iconicName;
	parameters.parentTreecell = parentTreecell;
	parameters.tree = tree;
	parameters.typeP = typeP;
	parameters.newPropName = textboxName.value;
	parameters.propType = ptype;
	if (typeP == "property") {
		parameters.isRootNode = "true";
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addProperty&propertyQName="
						+ encodeURIComponent(textboxName.value)
						+ "&propertyType=" + encodeURIComponent(ptype), false,
				parameters);

	} else {
		parameters.isRootNode = "false";
		httpGet(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=addProperty&propertyQName="
						+ encodeURIComponent(textboxName.value)
						+ "&superPropertyQName="
						+ encodeURIComponent(iconicName)
						+ "&propertyType="
						+ encodeURIComponent(ptype), false, parameters);

	}
	close();
}
