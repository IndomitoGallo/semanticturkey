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
 
if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

 window.onload = function() {
	document.getElementById("createProperty").addEventListener("click",art_semanticturkey.onAccept,true);
	document.getElementById("cancel").addEventListener("click",art_semanticturkey.onCancel,true);
	document.getElementById("newValue").addEventListener("command",
			art_semanticturkey.onAccept, true);
	document.getElementById("newValue").focus();	
	art_semanticturkey.setPanel();
};
 
art_semanticturkey.setPanel= function() {
		var defaultRangeType=window.arguments[0].rangeType;
		if(defaultRangeType == "undefined"){
			var rangeLbl = document.createElement("label");
			rangeLbl.setAttribute("id", "lblvalue");
			rangeLbl.setAttribute("value", "Insert Range Type:");
			var row1 = document.createElement("row");
			row1.appendChild(rangeLbl);
			var row2 = document.createElement("row");
			var rangeMenuList = document.createElement("menulist");
			rangeMenuList.setAttribute("id", "rangeMenu");
			var rangeMenupopup = document.createElement("menupopup");
			var rangeMenuitem = document.createElement("menuitem");
			var rangList = new art_semanticturkey.dataRangeList();
			var listLength = rangList.getLength();
			for(var i=0; i<listLength; ++i){
				rangeMenuitem.setAttribute('label', rangList.getElement(i));
				rangeMenuitem.setAttribute('id', rangList.getElement(i));
				rangeMenupopup.appendChild(rangeMenuitem);
				rangeMenuitem = document.createElement("menuitem");
			}
			rangeMenuList.appendChild(rangeMenupopup);
			row2.appendChild(rangeMenuList);
			rangeMenuList.selectedItem=document.getElementById(defaultRangeType);
			rangeMenupopup.selectedItem=document.getElementById(defaultRangeType);
		}else if(defaultRangeType == "dataRange"){
			document.getElementById("valueLabel").setAttribute("hidden",true);
			document.getElementById("valueRow").setAttribute("hidden",true);
			var rangeLbl = document.createElement("label");
			rangeLbl.setAttribute("id", "lblvalue");
			rangeLbl.setAttribute("value", "Insert Range Value:");
			var row1 = document.createElement("row");
			row1.appendChild(rangeLbl);
			var dataRangesValueList = window.arguments[0].dataRangesValueList;
			var row2 = document.createElement("row");
			var rangeMenuList = document.createElement("menulist");
			rangeMenuList.setAttribute("id", "rangeMenu");
			var rangeMenupopup = document.createElement("menupopup");
			var rangeMenuitem = document.createElement("menuitem");
			var listLength = dataRangesValueList.length;
			for(var i=0; i<listLength; ++i){
				rangeMenuitem.setAttribute('label', (dataRangesValueList[i]).show);
				rangeMenuitem.setAttribute('id',(dataRangesValueList[i]).show);
				rangeMenuitem.setAttribute('rangeType',(dataRangesValueList[i]).rangeType);
				rangeMenuitem.setAttribute('type',(dataRangesValueList[i]).type);
				rangeMenupopup.appendChild(rangeMenuitem);
				rangeMenuitem = document.createElement("menuitem");
			}
			rangeMenuList.appendChild(rangeMenupopup);
			row2.appendChild(rangeMenuList);
		}
		
		var boxrows = document.getElementById("boxrows");
		boxrows.appendChild(row1);
		boxrows.appendChild(row2);
		
		
		
		if (window.arguments[0].predicatePropertyName == "rdfs:comment") {
			var propValue = document.getElementById("newValue");
			propValue.setAttribute("multiline", "true");
			propValue.setAttribute("wrap", "on");
			propValue.setAttribute("cols", "1");
			propValue.setAttribute("rows", "3");
		}	
};

art_semanticturkey.onAccept= function() {
	var range = window.arguments[0].rangeType;
	var type = "typedLiteral";
	if(range == "dataRange"){
		var rangeMenuList=document.getElementById("rangeMenu");
		var rangeMenuitem =rangeMenuList.selectedItem;
		range = rangeMenuitem.getAttribute('rangeType');
		type =rangeMenuitem.getAttribute('type');
		var propValue = rangeMenuitem.getAttribute('id');
	}else if(range == "undefined"){
		var rangeMenuList=document.getElementById("rangeMenu");
		var rangeMenuitem =rangeMenuList.selectedItem;
		range = rangeMenuitem.getAttribute('rangeType');
		var propValue = document.getElementById("newValue").value;
	}else{
		var propValue = document.getElementById("newValue").value;
	}
	try{
			window.arguments[0].parentWindow.art_semanticturkey.STRequests.Property.createAndAddPropValue(
					window.arguments[0].sourceElementName,
					window.arguments[0].predicatePropertyName,
					propValue,
					range,
					type
			);
		
		close();
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.onCancel= function() {
	window.arguments[0].oncancel = true;
	window.close();
};
