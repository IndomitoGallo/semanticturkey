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

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function() {
	document.getElementById("accept").addEventListener("click",
			art_semanticturkey.onAccept, true);
	
	document.getElementById("cancel").addEventListener("click",
			art_semanticturkey.onCancel, true);
	art_semanticturkey.setRangeList();					
};
art_semanticturkey.setRangeList = function(){
	var rangList = new art_semanticturkey.dataRangeList();
	var listLength = rangList.getLength();
	for(var i=0; i<listLength; ++i){
		li = document.createElement("listitem");
		li.setAttribute("label",rangList.getElement(i));
		document.getElementById("ranges").appendChild(li);
	}
};
art_semanticturkey.onAccept= function() {
			var newRange=document.getElementById("ranges").selectedItem.label;
			window.arguments[0].rangeName=newRange;
			close();
};
art_semanticturkey.onCancel = function() {
	close();
};