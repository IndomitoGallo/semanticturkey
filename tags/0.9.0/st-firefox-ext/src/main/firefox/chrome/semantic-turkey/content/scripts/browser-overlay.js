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
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/PrefUtils.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", this.art_semanticturkey); // TODO why this?
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);



art_semanticturkey.onLangAccept = function(win) {
	var selectedItem = win.document.getElementById("languages").selectedItem;
	win.arguments[0].lang = selectedItem.getAttribute("label");
	win.close();
};

art_semanticturkey.toggleSidebar1 = function() {
	toggleSidebar("stOntologySidebar");
};
art_semanticturkey.toggleSidebar2 = function() {
	toggleSidebar("stImportsSidebar");
};
art_semanticturkey.toggleSidebar3 = function() {
	toggleSidebar("stSKOSSidebar");
};

art_semanticturkey.chkST_started = function() {
	var stIsStarted = art_semanticturkey.ST_started.getStatus();
	if (stIsStarted == "true") {
		document.getElementById("startSt").disabled = true;
		// document.getElementById("key_openSTOntologySidebar").disabled =
		// false;
		// document.getElementById("key_openSTImportsSidebar").disabled = false;
		// document.getElementById("key_openSTSKOSSidebar").disabled = false;
		// document.getElementById("SPARQL").disabled = false;
		// document.getElementById("visualization").disabled = false;
		// document.getElementById("visualization2").disabled = false;
		document.getElementById("projects_ST_Menu").disabled = false;
		document.getElementById("manage_all_projects").disabled = false;

	}
};
art_semanticturkey.SPARQL = function() {
	art_semanticturkey.openUrl("chrome://semantic-turkey/content/sparql/sparql.xul");
};

art_semanticturkey.semnavigation = function() {
	var isHumanReadable = art_semanticturkey.Preferences
			.get("extensions.semturkey.skos.humanReadable", false);

	var authority = art_semanticturkey.HttpMgr.getAuthority();
	// art_semanticturkey.openUrl("http://127.0.0.1:1979/semantic_turkey/resources/graph.html");
	var graphURL = "http://"
			+ authority
			+ "/semantic_turkey/resources/graph.html?humanReadable="
			+ isHumanReadable
			+ "&lang="
			+ encodeURIComponent(art_semanticturkey.Preferences.get(
					"extensions.semturkey.annotprops.defaultlang", "en"));
	art_semanticturkey.Logger.debug("opening graph url: " + graphURL);
	art_semanticturkey.openUrl(graphURL);
};

art_semanticturkey.chk_SaveCurrentProjectMenuitem = function() {
	var isContinuosEditing = art_semanticturkey.CurrentProject.isContinuosEditing();
	if (isContinuosEditing == true)
		document.getElementById("save_project").disabled = true;
	else
		document.getElementById("save_project").disabled = false;
}

art_semanticturkey.save_project = function() {
	try {
		art_semanticturkey.STRequests.Projects.saveProject();
	} catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.save_as_project = function() {
	var parameters = new Object();
	parameters.savedAsProject = false;
	parameters.newProjectName = "";

	window.openDialog("chrome://semantic-turkey/content/projects/saveAsProject.xul", "_blank",
			"modal=yes,resizable,centerscreen", parameters);

};

art_semanticturkey.export_project = function() {
	var parameters = new Object();

	window.openDialog("chrome://semantic-turkey/content/projects/exportProject.xul", "_blank",
			"modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.manage_all_projects = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	window.openDialog("chrome://semantic-turkey/content/projects/manageProjects.xul", "_blank",
			"chrome,dependent,dialog,modal=yes,resizable,centerscreen", parameters);
	/*
	 * parameters.properClose = false; while(parameters.properClose == false) { window.openDialog(
	 * "chrome://semantic-turkey/content/projects/manageProjects.xul", "_blank",
	 * "modal=yes,resizable,centerscreen", parameters); }
	 */
};

art_semanticturkey.enableSTToolbarButtons = function() {
	document.getElementById("startSTToolBarButton").hidden = true;
	document.getElementById("prjManagementToolBarButton").hidden = false;
	/*
	 * document.getElementById("ontPanelToolBarButton").hidden = false;
	 * document.getElementById("importsToolBarButton").hidden = false;
	 * document.getElementById("SPARQLToolBarButton").hidden = false; var isDefaultSet =
	 * art_semanticturkey.Preferences.get("extensions.semturkey.isDefaultSet", false); var
	 * defaultProjectOntType =
	 * art_semanticturkey.Preferences.get("extensions.semturkey.defaultProjectOntType", "null");
	 * if(isDefaultSet == true && defaultProjectOntType.indexOf("SKOS") != -1)
	 * document.getElementById("SKOSToolBarButton").hidden = false; else
	 * document.getElementById("SKOSToolBarButton").hidden = true;
	 */
};

art_semanticturkey.startSTServer = function() {
	art_semanticturkey.startST();
};

/*
 * art_semanticturkey.restartFirefox = function(){ var nsIAppStartup = Components.interfaces.nsIAppStartup;
 * Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(
 * nsIAppStartup.eForceQuit | nsIAppStartup.eRestart); };
 */

art_semanticturkey.associateEventsOnBrowserGraphicElements = function() {
	document.getElementById("menu_ToolsPopup").addEventListener("popupshowing",
			art_semanticturkey.chkST_started, true);
	// document.getElementById("startSt").addEventListener("command",art_semanticturkey.JavaFirefoxSTBridge.initialize,true);
	document.getElementById("startSt").addEventListener("command", art_semanticturkey.startSTServer, true);
	document.getElementById("key_openSTOntologySidebar").addEventListener("command",
			art_semanticturkey.toggleSidebar1, true);
	document.getElementById("key_openSTImportsSidebar").addEventListener("command",
			art_semanticturkey.toggleSidebar2, true);
	document.getElementById("key_openSTSKOSSidebar").addEventListener("command",
			art_semanticturkey.toggleSidebar3, true);
	document.getElementById("SPARQL").addEventListener("command", art_semanticturkey.SPARQL, true);
	/*
	 * document.getElementById("sidebar_openSageSidebar").addEventListener("command",art_semanticturkey.toggleSidebar1,true);
	 * document.getElementById("sidebar_openSageSidebar2").addEventListener("command",art_semanticturkey.toggleSidebar2,true);
	 */
	document.getElementById("mode_normal").addEventListener("command",
			art_semanticturkey.ContexMenu.visualizationOptionNormal, true);
	document.getElementById("mode_debug").addEventListener("command",
			art_semanticturkey.ContexMenu.visualizationOptionDebug, true);
	/*
	 * document.getElementById("sidebar_normal").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionNormal,true);
	 * document.getElementById("sidebar_debug").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionDebug,true);
	 */
	document.getElementById("export_repository").addEventListener("command",
			art_semanticturkey.ContexMenu.exportRepository, true);
	document.getElementById("load_repository").addEventListener("command",
			art_semanticturkey.ContexMenu.loadRdf, true);
	document.getElementById("clear_repository").addEventListener("command",
			art_semanticturkey.ContexMenu.clearRepository, true);
	document.getElementById("mirror_ontologies").addEventListener("command",
			art_semanticturkey.ContexMenu.manageOntologyMirror, true);
	document.getElementById("status-bar-annotation").addEventListener("click",
			art_semanticturkey.viewAnnotationOnPage, true);
	document.getElementById("status-bar-bookmark").addEventListener("click",
			art_semanticturkey.openBookmarksDialog, true);

	// Projects menu
	document.getElementById("save_project")
			.addEventListener("command", art_semanticturkey.save_project, true);
	document.getElementById("save_as_project").addEventListener("command",
			art_semanticturkey.save_as_project, true);
	document.getElementById("export_project").addEventListener("command", art_semanticturkey.export_project,
			true);
	document.getElementById("manage_all_projects").addEventListener("command",
			art_semanticturkey.manage_all_projects, true);
	document.getElementById("projects_menu_ToolsPopup").addEventListener("popupshowing",
			art_semanticturkey.chk_SaveCurrentProjectMenuitem, true);

	// sd-toolbar
	document.getElementById("startSTToolBarButton").addEventListener("command",
			art_semanticturkey.startSTServer, true);
	document.getElementById("prjManagementToolBarButton").addEventListener("command",
			art_semanticturkey.manage_all_projects, true);
	document.getElementById("ontPanelToolBarButton").addEventListener("command",
			art_semanticturkey.toggleSidebar1, true);
	document.getElementById("importsToolBarButton").addEventListener("command",
			art_semanticturkey.toggleSidebar2, true);
	document.getElementById("SPARQLToolBarButton").addEventListener("command", art_semanticturkey.SPARQL,
			true);
	document.getElementById("SKOSToolBarButton").addEventListener("command",
			art_semanticturkey.toggleSidebar3, true);
	document.getElementById("graphBarButton").addEventListener("command", art_semanticturkey.semnavigation,
			true);

	document.getElementById("humanReadableButton").addEventListener("command",
			art_semanticturkey.humanReadableButtonClick, true);
	document.getElementById("humanReadableButton").prefListener = new art_semanticturkey.PrefListener(
			"extensions.semturkey.skos.", function(branch, name) {
				if (name == "humanReadable") {
					var isReadable = branch.getBoolPref(name);

					document.getElementById("humanReadableButton").checked = isReadable;
				}
			}); // The listener is prevented from being garbage collected, by
	// attaching it to the button
	document.getElementById("humanReadableButton").prefListener.register(true); // true
	// causes
	// the
	// callback
	// to
	// be
	// invoked
	// on
	// registration

	var stIsStarted = art_semanticturkey.ST_started.getStatus();

	art_semanticturkey.eventListenerBrowserOverlayArrayObject = new art_semanticturkey.eventListenerArrayClass();

	if (stIsStarted == "true") {
		art_semanticturkey.enableSTToolbarButtons();
	} else {
		art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
				"st_started", art_semanticturkey.enableSTToolbarButtons, null);
	}

	// Adding an three ojbects waiting for the events projectOpened ,
	// projectClosed and projectChangedName
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
			"projectOpened", art_semanticturkey.changeProjectObj, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
			"projectClosed", art_semanticturkey.changeProjectObj, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
			"projectChangedName", art_semanticturkey.changeProjectObj, null);

	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
			"projectOpened", art_semanticturkey.enableDropOnBrowser, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister(
			"projectClosed", art_semanticturkey.disableDropOnBrowser, null);

	/*
	 * var projectOpened = new art_semanticturkey.changeProjectObj();
	 * art_semanticturkey.evtMgr.registerForEvent("projectOpened",projectOpened); var projectClosed = new
	 * art_semanticturkey.changeProjectObj();
	 * art_semanticturkey.evtMgr.registerForEvent("projectClosed",projectClosed); var projectChangedName = new
	 * art_semanticturkey.changeProjectObj();
	 * art_semanticturkey.evtMgr.registerForEvent("projectChangedName",projectChangedName);
	 */

	// Adding an observer for the closing of firefox and for its restart
	var observerService = Components.classes["@mozilla.org/observer-service;1"]
			.getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(new art_semanticturkey.myObserverFirefoxClosed(),
			"quit-application-requested", false); // close
	observerService.addObserver(new art_semanticturkey.myObserverFirefoxClosed(), "quit-application", false); // restart
};

art_semanticturkey.myObserverFirefoxClosed = function() {
	this.observe = function() {
		var sidebarWindow = document.getElementById("sidebar").contentWindow;
		var locHref = sidebarWindow.location.href;
		if ((locHref == "chrome://semantic-turkey/content/metadata/imports.xul")
				|| (locHref == "chrome://semantic-turkey/content/tabs.xul")
				|| ("chrome://semantic-turkey/content/skos/tabs.xul")) {
			toggleSidebar();
		}
		var isContinuosEditing = art_semanticturkey.CurrentProject.isContinuosEditing();
		var isNull = art_semanticturkey.CurrentProject.isNull();
		if (isNull == false && isContinuosEditing == false) {
			var currentProectName = art_semanticturkey.CurrentProject.getProjectName();
			var risp = confirm("Save project " + currentProectName + "?");
			if (risp)
				art_semanticturkey.save_project();
		}
	};
};

art_semanticturkey.changeProjectObj = function(eventId, projectInfo) {
	if (eventId == "projectOpened") {
		var projectName = projectInfo.getProjectName();
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName(
				"broadcaster");
		for ( var i = 0; i < broadcasterList.length; ++i) {
			if (broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true") {
				var label = broadcasterList[i].getAttribute("label");
				broadcasterList[i].setAttribute("sidebartitle", label + " ( " + projectName + " )");
			}
		}
		document.getElementById("ontPanelToolBarButton").hidden = false;
		document.getElementById("importsToolBarButton").hidden = false;
		document.getElementById("SPARQLToolBarButton").hidden = false;
		document.getElementById("graphBarButton").hidden = false;
		document.getElementById("save_project").setAttribute("label", "Save " + projectName);
		if (art_semanticturkey.CurrentProject.isContinuosEditing() == false)
			document.getElementById("save_project").disabled = false;
		document.getElementById("save_as_project").setAttribute("label", "Save " + projectName + " as ...");
		document.getElementById("save_as_project").disabled = false;
		document.getElementById("export_project").setAttribute("label", "Export " + projectName);
		document.getElementById("export_project").disabled = false;
		document.getElementById("key_openSTOntologySidebar").disabled = false;
		document.getElementById("key_openSTImportsSidebar").disabled = false;
		document.getElementById("SPARQL").disabled = false;
		document.getElementById("key_openSTSKOSSidebar").disabled = false;
		document.getElementById("visualization").disabled = false;
		document.getElementById("visualization2").disabled = false;
		document.getElementById("projects_ST_Menu").disabled = false;
		document.getElementById("save_project").disabled = false;
		document.getElementById("save_as_project").disabled = false;
		document.getElementById("export_project").disabled = false;
		document.getElementById("manage_all_projects").disabled = false;
		document.getElementById("ontPanelToolBarButton").disabled = false;
		document.getElementById("importsToolBarButton").disabled = false;
		document.getElementById("SPARQLToolBarButton").disabled = false;
		document.getElementById("graphBarButton").disabled = false;
		document.getElementById("SKOSToolBarButton").disabled = false;
		if (projectInfo.getType().indexOf("SKOS") != -1) {
			document.getElementById("SKOSToolBarButton").hidden = false;
			document.getElementById("key_openSTSKOSSidebar").hidden = false;
			document.getElementById("key_openSTSKOSSidebar").disabled = false;
			document.getElementById("humanReadableButton").hidden = false;

			if (typeof art_semanticturkey.skosStateManagemenet.stEventArray != "undefined") {
				art_semanticturkey.skosStateManagemenet.stEventArray.deregisterAllListener();
			}

			art_semanticturkey.skosStateManagemenet.selectedScheme = art_semanticturkey.STRequests.Projects
					.getProjectProperty("skos.selected_scheme", null).getElementsByTagName("property")[0]
					.getAttribute("value");

			art_semanticturkey.skosStateManagemenet.stEventArray = new art_semanticturkey.eventListenerArrayClass();
			art_semanticturkey.skosStateManagemenet.stEventArray.addEventListenerToArrayAndRegister(
					"resourceRenamed", art_semanticturkey.skosStateManagemenet.resourceRenamed);
			art_semanticturkey.skosStateManagemenet.stEventArray.addEventListenerToArrayAndRegister(
					"skosSchemeRemoved", art_semanticturkey.skosStateManagemenet.schemeRemoved);
			art_semanticturkey.skosStateManagemenet.stEventArray.addEventListenerToArrayAndRegister(
					"projectPropertySet", art_semanticturkey.skosStateManagemenet.projectPropertySet);
		} else {
			document.getElementById("SKOSToolBarButton").hidden = true;
			document.getElementById("key_openSTSKOSSidebar").hidden = true;
			document.getElementById("key_openSTSKOSSidebar").disabled = true;
			document.getElementById("humanReadableButton").hidden = true;
		}
	} else if (eventId == "projectClosed") {
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName(
				"broadcaster");
		for ( var i = 0; i < broadcasterList.length; ++i) {
			if (broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true") {
				var label = broadcasterList[i].getAttribute("label");
				broadcasterList[i].setAttribute("sidebartitle", label + " ( )");
			}
		}
		document.getElementById("save_project").disabled = true;
		document.getElementById("save_as_project").disabled = true;
		document.getElementById("save_as_project").setAttribute("label", "Save ??? as ...");
		document.getElementById("export_project").disabled = true;
		document.getElementById("export_project").setAttribute("label", "Export");
		document.getElementById("key_openSTOntologySidebar").disabled = true;
		document.getElementById("key_openSTImportsSidebar").disabled = true;
		document.getElementById("SPARQL").disabled = true;
		document.getElementById("key_openSTSKOSSidebar").disabled = true;
		document.getElementById("visualization").disabled = true;
		document.getElementById("visualization2").disabled = true;
		document.getElementById("save_project").disabled = true;
		document.getElementById("projects_ST_Menu").disabled = false;
		document.getElementById("save_project").disabled = true;
		document.getElementById("save_as_project").disabled = true;
		document.getElementById("export_project").disabled = true;
		document.getElementById("manage_all_projects").disabled = false;
		document.getElementById("ontPanelToolBarButton").disabled = true;
		document.getElementById("importsToolBarButton").disabled = true;
		document.getElementById("SPARQLToolBarButton").disabled = true;
		document.getElementById("graphBarButton").disabled = true;
		document.getElementById("SKOSToolBarButton").disabled = true;

		if (typeof art_semanticturkey.skosStateManagemenet.stEventArray != "undefined") {
			art_semanticturkey.skosStateManagemenet.stEventArray.unregister();
			art_semanticturkey.skosStateManagemenet.stEventArray = undefined;
		}
	} else if (eventId == "projectChangedName") {
		var projectName = projectInfo.projectName;
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName(
				"broadcaster");
		for ( var i = 0; i < broadcasterList.length; ++i) {
			if (broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true") {
				var label = broadcasterList[i].getAttribute("label");
				broadcasterList[i].setAttribute("sidebartitle", label + " ( " + projectName + " )");
				if (broadcasterList[i].getAttribute("checked") == "true") {
					document.getElementById('sidebar-title').value = label + " ( " + projectName + " )";
				}
			}
		}
		document.getElementById("save_project").setAttribute("label", "Save " + projectName);
		document.getElementById("save_as_project").setAttribute("label", "Save " + projectName + " as ...");
		document.getElementById("export_project").setAttribute("label", "Export " + projectName);
	}
};

window.addEventListener("load", art_semanticturkey.associateEventsOnBrowserGraphicElements, true);

art_semanticturkey.enableDropOnBrowser = function(eventId, projectOpenedObj) {
	gBrowser.addEventListener("drop", art_semanticturkey.dropOnBrowser, true);
	gBrowser.addEventListener("dragover", art_semanticturkey.dragOverBrowser, true);
};

art_semanticturkey.disableDropOnBrowser = function(eventId, projectOpenedObj) {
	gBrowser.removeEventListener("drop", art_semanticturkey.dropOnBrowser, true);
	gBrowser.removeEventListener("dragover", art_semanticturkey.dragOverBrowser, true);
};

art_semanticturkey.dragOverBrowser = function(event) {
	if (event.dataTransfer.types.contains("application/skos.concept")) {
		event.preventDefault();
	}
};

art_semanticturkey.dropOnBrowser = function(event) {
	if (event.dataTransfer.types.contains("application/skos.concept")) {
		event.preventDefault();

		try {
			var doc = event.target.ownerDocument;
			var urlPage = doc.documentURI;
			var title = doc.title;
			var topics = [ event.dataTransfer.getData("application/skos.concept") ];

			var topicCollection = art_semanticturkey.STRequests.Annotation.bookmarkPage(urlPage, title,
					topics);
		} catch (e) {
			alert(e.name + ": " + e.message);
		}
	}
};

art_semanticturkey.humanReadableButtonClick = function(event) {
	var oldState = art_semanticturkey.Preferences.get("extensions.semturkey.skos.humanReadable", false);
	var newState = art_semanticturkey.Preferences.set("extensions.semturkey.skos.humanReadable", !oldState);
};

art_semanticturkey.skosStateManagemenet = {};
art_semanticturkey.skosStateManagemenet.selectedScheme = "";
art_semanticturkey.skosStateManagemenet.resourceRenamed = function(eventId, resourceRenamedObj) {
	var oldName = resourceRenamedObj.getOldName();
	var newName = resourceRenamedObj.getNewName();

	if (oldName == art_semanticturkey.skosStateManagemenet.selectedScheme) {
		art_semanticturkey.STRequests.Projects.setProjectProperty("skos.selected_scheme", newName, {
			getName : function() {
				return "rename";
			}
		});
	}
};
art_semanticturkey.skosStateManagemenet.schemeRemoved = function(eventId, skosSchemeRemovedObj) {
	var name = skosSchemeRemovedObj.getSchemeName();

	if (name == art_semanticturkey.skosStateManagemenet.selectedScheme) {
		art_semanticturkey.STRequests.Projects.setProjectProperty("skos.selected_scheme", "");
	}
};
art_semanticturkey.skosStateManagemenet.projectPropertySet = function(eventId, projectPropertySetObj) {
	if (projectPropertySetObj.getPropName() == "skos.selected_scheme") {
		art_semanticturkey.skosStateManagemenet.selectedScheme = projectPropertySetObj.getPropValue();
	}
};