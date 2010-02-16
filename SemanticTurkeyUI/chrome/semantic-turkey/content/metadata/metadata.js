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

if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);

/**
 * this function changes both values of baseuri and namespace
 * 
 * @author Noemi Scarpato
 */
art_semanticturkey.changeBaseuri_Namespace = function(type, txbox, changed) {
	var button = document.getElementById("lockBtn");
	art_semanticturkey.Logger.debug("cheked  type " + button.getAttribute("checked"));
	art_semanticturkey.Logger.debug("type " + type);
	if (button.getAttribute("checked") == "true") {
		var basetxbox = document.getElementById("baseUriTxtBox");
		var nstxbox = document.getElementById("nsTxtBox");
		if (changed == "true") {
			var risp = confirm("Save change of baseuri and namespace?");
			if (risp) {
				var valBase = basetxbox.value;
				if ( art_semanticturkey.stringEndsWith(basetxbox, '#') ) {
					var len = basetxbox.value.length - 1;
					valBase = basetxbox.value.substring(0, len);
				}
				if ( art_semanticturkey.stringEndsWith(nstxbox, '#') || art_semanticturkey.stringEndsWith(nstxbox, '/') ) {
					try{
						var responseXML = art_semanticturkey.STRequests.Metadata.setBaseuriDefNamespace(valBase, nstxbox.value);
						art_semanticturkey.setBaseuriDefNamespace_RESPONSE(responseXML);
					}
					catch (e) {
						alert(e.name + ": " + e.message);
					}
				} else {
					alert("Default Namespace should end with '#' or '/'");
				}
			}
		}

	} else {
		if (type == "base") {
			if (changed == "true") {
				var risp = confirm("Save change of baseuri?");
				if (risp) {
					var valBase = txbox.value;
					if ( art_semanticturkey.stringEndsWith(txbox, '#') ) {
						var len = txbox.value.length - 1;
						valBase = txbox.value.substring(0, len);
					}
					try{
						var responseXML = art_semanticturkey.STRequests.Metadata.setBaseuri(valBase);
						art_semanticturkey.setBaseuri_RESPONSE(responseXML);
					}
					catch (e) {
						alert(e.name + ": " + e.message);
					}
				}
			}
		} else {
			if (changed == "true") {
				var risp = confirm("Save change of namespace?");
				if (risp) {
					if ( art_semanticturkey.stringEndsWith(txbox, '#') || art_semanticturkey.stringEndsWith(txbox, '/') ) {
						try{
							var responseXML = art_semanticturkey.STRequests.Metadata.setDefaultNamespace(txbox.value);
							art_semanticturkey.setDefaultNamespace_RESPONSE(responseXML);
						}
						catch (e) {
							alert(e.name + ": " + e.message);
						}
					} else {
						alert("Default Namespace should end with '#' or '/'");
					}
				}
			}
		}
	}
};

art_semanticturkey.setBaseuriDefNamespace_RESPONSE = function(responseElement){
	var status = responseElement.getElementsByTagName("reply")[0].getAttribute("status");
	if(status == "ok"){
		document.getElementById("baseUriTxtBox").setAttribute("isChanged", "false");
		document.getElementById("baseUriTxtBox").style.color = 'black';
		document.getElementById("nsTxtBox").setAttribute("isChanged", "false");
		document.getElementById("nsTxtBox").style.color = 'black';
	}
};

art_semanticturkey.setBaseuri_RESPONSE = function(responseElement){
	var status = responseElement.getElementsByTagName("reply")[0].getAttribute("status");
	if(status == "ok") {
		document.getElementById("baseUriTxtBox").setAttribute("isChanged", "false");
		document.getElementById("baseUriTxtBox").style.color = 'black';
	}
};

art_semanticturkey.setDefaultNamespace_RESPONSE = function(responseElement){
	var status = responseElement.getElementsByTagName("reply")[0].getAttribute("status");
	if(status == "ok"){
		document.getElementById("nsTxtBox").setAttribute("isChanged", "false");
		document.getElementById("nsTxtBox").style.color = 'black';
	}
};

/**
 * @author NScarpato 18/04/2008 checkbind
 */
art_semanticturkey.checkbind = function() {
	var button = document.getElementById("lockBtn");
	var baseUriTxtBox = document.getElementById("baseUriTxtBox");
	var nsTxtBox = document.getElementById("nsTxtBox");
	if (button.checked == true) {
		button.image = "../images/lock.png";
		baseUriTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInputBind('base',this);");
		nsTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInputBind('ns',this);");
	} else {
		button.image = "../images/unlock.png";
		baseUriTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInput('base',this);");
		nsTxtBox.setAttribute("onkeyup", "art_semanticturkey.manageInput('ns',this);");
	}
}; 
 
/**
 * @author NScarpato 17/04/2008 manageInput
 */
art_semanticturkey.manageInputBind = function(type, txbox) {
	var isurl = art_semanticturkey.isUrl(txbox.value);//N.B. import utilities.js to use this function
	var baseUriTxtBox = document.getElementById("baseUriTxtBox");
	var nsTxtBox = document.getElementById("nsTxtBox");
	if (isurl == true) {
		baseUriTxtBox.style.color = 'blue';
		nsTxtBox.style.color = 'blue';
	} else {
		baseUriTxtBox.style.color = 'red';
		nsTxtBox.style.color = 'red';
	}
	if (type == "ns") {
		val = txbox.value;
		if ( art_semanticturkey.stringEndsWith(txbox, '#') ) {
			var len = txbox.value.length - 1;
			val = txbox.value.substring(0, len);
			art_semanticturkey.Logger.debug("value" + val);
		}
		document.getElementById("baseUriTxtBox").value = val;
		document.getElementById("baseUriTxtBox").setAttribute("isChanged", "false");
	} else {
		document.getElementById("nsTxtBox").value = txbox.value + "#";
		document.getElementById("nsTxtBox").setAttribute("isChanged", "false");
	}
};

// TODO sembra che nessuno la chiami questa funzione
/*art_semanticturkey.setBaseuri_Namespace = function(type, windw) {
	art_semanticturkey.changeBaseuri_Namespace(type, windw, changed);
};*/

