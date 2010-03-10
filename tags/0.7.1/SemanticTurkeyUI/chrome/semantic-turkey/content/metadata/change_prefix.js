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


/** NScarpato */
// TODO vedere se serve
//netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

/** Funzione che crea gli elementi di EditorPanel in base al type */


window.onload = function(){
	
	document.getElementById("changePrefix").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
	
	changetxbox=document.getElementById("changetxb");
	changetxbox.setAttribute("value",changetxbox.getAttribute("value")+window.arguments[0].namespace);
	  
}

art_semanticturkey.onAccept = function() {
	var newPrefix = document.getElementById("prefix").value;
	try{
		var responseXML = window.arguments[0].parentWindow.art_semanticturkey.STRequests.Metadata.changeNSPrefixMapping(
				newPrefix, 
				window.arguments[0].namespace);
		window.arguments[0].parentWindow.art_semanticturkey.changeNSPrefixMapping_RESPONSE(responseXML);
		close();
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.cancel = function(){
	close();
}