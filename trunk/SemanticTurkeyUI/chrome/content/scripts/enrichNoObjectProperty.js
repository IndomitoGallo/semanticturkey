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
 * setPanel
 * 
 * @param
 */
 var langsPrefsEntry="extensions.semturkey.annotprops.langs";
 var defaultLangPref="extensions.semturkey.annotprops.defaultlang";
function setPanel() {
	if (window.arguments[0].typeValue == "owl:AnnotationProperty" || window.arguments[0].typeValue == "owl:AnnotationProperty_noexpl") {
		langLbl = document.createElement("label");
		langLbl.setAttribute("id", "lblvalue");
		langLbl.setAttribute("value", "Insert Annotation language:");
		row1 = document.createElement("row");
		row1.appendChild(langLbl);
		var langMenulist = document.createElement("menulist");
		langMenulist.setAttribute("id", "langMenu");
		//langMenulist.setAttribute("label", "select Annotation language");
		var langMenupopup = document.createElement("menupopup");
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefBranch);
		var langList = prefs.getCharPref(langsPrefsEntry).split(",");
		langList.sort();
		var langMenuitem = document.createElement("menuitem");
		for (var i = 0; i < langList.length; i++) {
			langMenuitem.setAttribute('label', langList[i]);
			langMenuitem.setAttribute('id', langList[i]);
			langMenupopup.appendChild(langMenuitem);
			langMenuitem = document.createElement("menuitem");
		}
		row2 = document.createElement("row");
		langMenulist.appendChild(langMenupopup);
		row2.appendChild(langMenulist);
		boxrows = document.getElementById("boxrows");
		boxrows.appendChild(row1);
		boxrows.appendChild(row2);
		var defaultLang=prefs.getCharPref(defaultLangPref);
		alert("Default Lang"+defaultLang);
		langMenulist.selectedItem=document.getElementById(defaultLang);
		langMenupop.selectedItem=document.getElementById(defaultLang);
		if (window.arguments[0].predicatePropertyName == "rdfs:comment") {
			var propValue = document.getElementById("newValue");
			propValue.setAttribute("multiline", "true");
			propValue.setAttribute("wrap", "on");
			propValue.setAttribute("cols", "1");
			propValue.setAttribute("rows", "3");
		}
		
	}

}
function getthetree() {
	return tree;
}
function onAccept() {
	range = "";
	parameters = new Object();
	parameters.range = range;
	httpGet(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=getRangeClassesTree&propertyQName="
					+ encodeURIComponent(window.arguments[0].predicatePropertyName),
			false, parameters);
	parameters = new Object();
	parameters.parentBox = window.arguments[0].parentBox;
	parameters.rowBox = window.arguments[0].rowsBox;
	propValue = document.getElementById("newValue").value;
	parameters.propValue = propValue;
	if (window.arguments[0].typeValue == "owl:AnnotationProperty" || window.arguments[0].typeValue == "owl:AnnotationProperty_noexpl") {
		menu = document.getElementById("langMenu");
		lang = menu.selectedItem.label;
		// httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue)+"&rangeClsQName="+encodeURIComponent(parameters.range)+"&lang="+encodeURIComponent(lang),false,parameters);
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="
						+ encodeURIComponent(window.arguments[0].sourceElementName)
						+ "&propertyQName="
						+ encodeURIComponent(window.arguments[0].predicatePropertyName)
						+ "&value="
						+ encodeURIComponent(propValue)
						+ "&lang="
						+ encodeURIComponent(lang), false, parameters);
	} else {
		// httpGetP("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="+encodeURIComponent(window.arguments[0].sourceElementName)+"&propertyQName="+encodeURIComponent(window.arguments[0].predicatePropertyName)+"&value="+encodeURIComponent(propValue)+"&rangeClsQName="+encodeURIComponent(parameters.range),false,parameters);
		httpGetP(
				"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&request=createAndAddPropValue&instanceQName="
						+ encodeURIComponent(window.arguments[0].sourceElementName)
						+ "&propertyQName="
						+ encodeURIComponent(window.arguments[0].predicatePropertyName)
						+ "&value=" + encodeURIComponent(propValue), false,
				parameters);
	}
	close();
}

function onCancel() {
	window.arguments[0].oncancel = true;
	window.close();
}
