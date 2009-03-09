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
var ContexMenu = new Object();

/**
 * Code to handle context menu's "Annotate selection" option.
 */

ContexMenu.annotateSelection = function() {
	if (!Components.classes["@mozilla.org/xpointer-service;1"]) {
		window
				.alert("Please install the XPointerService from http://xpointerlib.mozdev.org/");
		return;
	}

	var focusedWindow = document.commandDispatcher.focusedWindow;
	var wrapper = new XPCNativeWrapper(focusedWindow, 'getSelection()');
	var seln = wrapper.getSelection();
	var url = focusedWindow.location.href;

	var xptrService = Components.classes["@mozilla.org/xpointer-service;1"]
			.getService()
			.QueryInterface(Components.interfaces.nsIXPointerService);

	var xptr = xptrService.createXPointerFromSelection(seln,
			focusedWindow.document);

	window.content.document.location.href = "http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=annotate&document="
			+ url + "&selection=" + seln;
}
// NScarpato 18/07/07 add Visualization option function this function select the
// visualization type Normal o debug
ContexMenu.manageOntologyMirror = function() {
	window.open("chrome://semantic-turkey/content/mirror.xul", "showmore",
			"chrome, modal,resizable");
}
ContexMenu.visualizationOptionNormal = function() {
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=setAdminLevel&adminLevel=off");
	return;
}
ContexMenu.visualizationOptionDebug = function() {
	httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=administration&request=setAdminLevel&adminLevel=on");
	return;
}
ContexMenu.exportRepository = function() {
	window.openDialog("chrome://semantic-turkey/content/exportRepository.xul",
			"_blank", "modal=yes,resizable,centerscreen");
}
ContexMenu.loadRdf = function() {
	window.openDialog("chrome://semantic-turkey/content/loadRepository.xul",
			"_blank", "modal=yes,resizable,centerscreen");
	window.location.reload();
}
ContexMenu.clearRepository = function clearRepository() {
	risp = confirm("Clear Repository");
	if (risp) {
		httpGet("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=inputOutput&request=clear_repository");
	}
}
