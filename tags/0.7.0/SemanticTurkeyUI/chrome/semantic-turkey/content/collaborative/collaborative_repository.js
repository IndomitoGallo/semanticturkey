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
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);


function abilita() {
	document.getElementById("viewSageSidebar").setAttribute("disabled", false);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", false);
	document.getElementById("visualization2").setAttribute("disabled", false);
}

function disabilita() {
	document.getElementById("viewSageSidebar").setAttribute("disabled", true);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", true);
	document.getElementById("visualization2").setAttribute("disabled", true);
}

function repositoryChosen(idRepository) {
	document.getElementById("viewSageSidebar").setAttribute("disabled", false);
	document.getElementById("viewSageSidebar2").setAttribute("disabled", false);
	document.getElementById("visualization2").setAttribute("disabled", false);
	document.getElementById(idRepository).setAttribute("checked", true);

	document.getElementById("menuRepositoryM")
			.setAttribute("hasChosen", "true")

	var list = document.getElementById("menuRepositoryMP")
			.getElementsByTagName("menuitem");
	// art_semanticturkey.Logger.debug("in menuRepositoryMP ci sono "+list.length+"
	// elementi"); // da cancellare
	for (var i = 0; i < list.length; i++) {
		list[i].setAttribute("disabled", true);
	}
	closeSidebar();
}

function choseRepository(idRepository) {
	var parameters = new Object();
	parameters.typeR = "chosen";
	// art_semanticturkey.Logger.debug("*****2 choseRepository: "+idRepository); // da
	// cancellare
	art_semanticturkey.HttpMgr.GETP(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=repositoryChoice&repository="
					+ idRepository, false, parameters);
}

function isRepLoaded() {
	// art_semanticturkey.Logger.debug("*isRepLoaded*"); // da cancellare
	// art_semanticturkey.Logger.debug("document.getElementById(\"viewSageSidebar\"):
	// "+document.getElementById("viewSageSidebar")); // da cancellare
	var isLoaded;
	if (document.getElementById("visualization2") != null) {
		// isLoaded =
		// document.getElementById("visualization2").getAttribute("disabled");
		isLoaded = document.getElementById("menuRepositoryM")
				.getAttribute("hasChosen");
	} else {
		var mainWindow = window
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
		// art_semanticturkey.Logger.debug("mainWindow: "+mainWindow);
		// art_semanticturkey.Logger.debug("mainWindow.getElementById(\"viewSageSidebar\"):
		// "+mainWindow.getElementById("viewSageSidebar"));
		isLoaded = mainWindow.document.getElementById("menuRepositoryM")
				.getAttribute("hasChosen");
	}
	// art_semanticturkey.Logger.debug("+++++++++++++++++++++ isLoaded: "+isLoaded);
	if (isLoaded == "false") {
		return false;
	}
	return true;
}

function hasAlreadyAsk() {
	var hasAsked = document.getElementById("menuRepositoryM")
			.getAttribute("hasAsked");
	if (hasAsked == "false") {
		return false;
	}
	return true;
}

function trySendMsg() {
	var parameters = new Object();
	parameters.typeR = "list";
	// art_semanticturkey.Logger.debug("mando messaggio");
	art_semanticturkey.HttpMgr.GETP(
			"http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=repositoryChoice",
			false, parameters);
	// art_semanticturkey.Logger.debug("messaggio mandato");
}

function closeSidebar() {
	var titleSB = document.getElementById("sidebar-title")
			.getAttribute("value");
	// art_semanticturkey.Logger.debug("$$$$$$$$$$$$$$$$$$$$$$$$$$$$ titleSB "+titleSB);
	// art_semanticturkey.Logger.debug("$$$$$$$$$$$$$ stateSB2 "+stateSB2);
	if ((titleSB == "Ontology Panel") || (titleSB == "Imports Management")) {
		// if(titleSB == "Segnalibri"){
		toggleSidebar();
		// nel caso non si sia riuscita a chiudere la sidebar con in questo
		// tentativo
		// art_semanticturkey.Logger.debug("$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CHIUSA SIDEBAR");
		setTimeout("closeSidebar()", 400);
	}
	/*
	 * if(stateSB1 == "false"){
	 * document.getElementById("viewSageSidebar").setAttribute("disabled",
	 * true); } if(stateSB2 == "false"){
	 * document.getElementById("viewSageSidebar2").setAttribute("disabled",
	 * true); }
	 */
}
