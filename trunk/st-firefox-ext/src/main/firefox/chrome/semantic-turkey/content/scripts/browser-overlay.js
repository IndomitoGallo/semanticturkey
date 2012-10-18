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
Components.utils.import("resource://stmodules/StartST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", 
		art_semanticturkey);
Components.utils.import("resource://stmodules/PrefUtils.jsm", 
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Annotation.jsm", 
		art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", this.art_semanticturkey);

art_semanticturkey.JavaFirefoxSTBridge = new Object();

art_semanticturkey.JavaFirefoxSTBridge._getExtensionPath = function(extensionName) {
	var chromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
	                                        .getService(Components.interfaces.nsIChromeRegistry);

	var uri = Components.classes["@mozilla.org/network/standard-url;1"]
	                             .createInstance(Components.interfaces.nsIURI);

	uri.spec = "chrome://" + extensionName + "/content/";

	var path = chromeRegistry.convertChromeURL(uri);
	if (typeof(path) == "object") {
		path = path.spec;
	}

	path = path.substring(0, path.indexOf("/chrome/") + 1);

	return path;
};

art_semanticturkey.JavaFirefoxSTBridge._packageLoader = function(urlStrings, trace) {
	art_semanticturkey.JavaFirefoxSTBridge._trace("packageLoader {");

	/*
	 * Starting from FF 15.0 the reference window.java is no longer available to
	 * scripts. A workaround consists in running an applet (e.g. java.applet.Applet)
	 * so that scripts may access the package java from it.
	 * For further information, see: https://bugzilla.mozilla.org/show_bug.cgi?id=748343
	 */ 
	var embeddedAppletElement = window.document.createElementNS("http://www.w3.org/1999/xhtml", "embed");
	embeddedAppletElement.setAttribute("id", "st_emebedded_java_applet");
	embeddedAppletElement.setAttribute("type", "application/x-java-applet");
	embeddedAppletElement.setAttribute("code", "java.applet.Applet");
	embeddedAppletElement.setAttribute("MAYSCRIPT", "true");
	embeddedAppletElement.setAttribute("width", "0");
	embeddedAppletElement.setAttribute("height", "0");
	
	// It seems that the applet is not initialized until it is inserted into the DOM tree.
	window.document.documentElement.appendChild(embeddedAppletElement);

	/*
	 * According to the first paragraph of this web page:
	 * http://docs.oracle.com/javase/tutorial/deployment/applet/appletStatus.html
	 * the execution of the following expression will be blocked until the applet has
	 * been initialized. However, this could freez FF.
	 */
	var java = embeddedAppletElement.Packages.java;

	var toUrlArray = function(a) {
		// var urlArray = java.lang.reflect.Array.newInstance(java.net.URL,
		// a.length);
		var dummyUrl = new java.net.URL("http://abc.xyz.org");
		var urlArray = java.lang.reflect.Array.newInstance(dummyUrl.getClass(), a.length); 
		for (var i = 0; i < a.length; i++) {
			var url = a[i];
			java.lang.reflect.Array.set(urlArray, i, (typeof url == "string")
					? new java.net.URL(url)
			: url);
		}
		return urlArray;
	};

	var firefoxClassLoaderURL = new java.net.URL(art_semanticturkey.JavaFirefoxSTBridge
			._getExtensionPath("semantic-turkey")
			+ "components/lib/javaFirefoxExtensionUtils.jar");

	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("classLoaderURL " + firefoxClassLoaderURL);

	// ===== Stage 1. Prepare to Give All Permission to the Java Code to be
	// Loaded =====

	/*
	 * Step 1. Load the bootstraping firefoxClassLoader.jar, which contains
	 * URLSetPolicy. We need URLSetPolicy so that we can give ourselves more
	 * permission.
	 */
	var bootstrapClassLoader = java.net.URLClassLoader
	.newInstance(toUrlArray([firefoxClassLoaderURL]));
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("created loader");

	/*
	 * Step 2. Instantiate a URLSetPolicy object from firefoxClassLoader.jar.
	 */
	var policyClass = java.lang.Class.forName(
			"edu.mit.simile.javaFirefoxExtensionUtils.URLSetPolicy", true,
			bootstrapClassLoader);
	var policy = policyClass.newInstance();
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("policy");

	/*
	 * Step 3. Now, the trick: We wrap our own URLSetPolicy around the current
	 * security policy of the JVM security manager. This allows us to give our
	 * own Java code whatever permission we want, even though Firefox doesn't
	 * give us any permission.
	 */
	policy.setOuterPolicy(java.security.Policy.getPolicy());
	java.security.Policy.setPolicy(policy);
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("set policy");

	/*
	 * Step 4. Give ourselves all permission. Yay!
	 */
	policy.addPermission(new java.security.AllPermission());
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("got all permissions");

	/*
	 * That's pretty much it for the security bootstraping hack. But we want to
	 * do a little more. We want our own class loader for subsequent JARs that
	 * we load.
	 */

	// ===== Stage 2. Create Our Own Class Loader so We Can Do Things Like
	// Tracing Class Loading =====
	/*
	 * Reload firefoxClassLoader.jar and so we can make use of
	 * TracingClassLoader. We need to reload it because when it was loaded
	 * previously, we had not yet set the policy to give it enough permission
	 * for loading classes.
	 */

	policy.addURL(firefoxClassLoaderURL);
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("added url");

	var firefoxClassLoaderPackages = new WrappedPackages(java.net.URLClassLoader
			.newInstance(toUrlArray([firefoxClassLoaderURL])));
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("wrapped loader");

	var tracingClassLoaderClass = firefoxClassLoaderPackages
	.getClass("edu.mit.simile.javaFirefoxExtensionUtils.TracingClassLoader");
	if (trace)
		art_semanticturkey.JavaFirefoxSTBridge._trace("got class");

	var classLoader = tracingClassLoaderClass.m("newInstance")(trace);
	art_semanticturkey.JavaFirefoxSTBridge._trace("got new loader");

	// ===== Stage 3. Actually Load the Code We Were Asked to Load =====

	var urls = toUrlArray(urlStrings);

	/*
	 * Give it the JARs we were asked to load - should now load them with all
	 * permissions.
	 */
	classLoader.add(firefoxClassLoaderURL);

	for (var i = 0; i < urls.length; i++) {
		var url = java.lang.reflect.Array.get(urls, i);
		classLoader.add(url);
		policy.addURL(url);
	}
	art_semanticturkey.JavaFirefoxSTBridge._trace("added urls");
	java.lang.Thread.currentThread().setContextClassLoader(classLoader);
	art_semanticturkey.JavaFirefoxSTBridge._trace("set context");

	/*
	 * Wrap up the class loader and return
	 */
	var packages = new WrappedPackages(classLoader);
	art_semanticturkey.JavaFirefoxSTBridge._trace("wrapped");

	art_semanticturkey.JavaFirefoxSTBridge._trace("} packageLoader");

	return packages;
};

/*
 * Wraps a class loader and allows easy access to the classes that it loads.
 */
function WrappedPackages(classLoader) {
	var packages = classLoader
	.loadClass("edu.mit.simile.javaFirefoxExtensionUtils.Packages")
	.newInstance();

	var arrayListClass = classLoader.loadClass("java.util.ArrayList");
	
	var argumentsToArray = function(args) {
		// this direct method is actualy not supported by current java versions,
		// so need to create
		// a dummy java object
		// var a = java.lang.reflect.Array.newInstance(java.lang.Object,
		// args.length);

		var a = arrayListClass.newInstance();
		for (var i = 0; i < args.length; i++) {
			//arrayClass.set(a, i, args[i]);
			a.add(args[i]);
		}
		return a.toArray();
	};

	this.getClass = function(className) {
		var classWrapper = packages.getClass(className);
		if (classWrapper) {
			return {
				n : function() {
				return classWrapper
				.callConstructor(argumentsToArray(arguments));
			},
			f : function(fieldName) {
				return classWrapper.getField(fieldName);
			},
			m : function(methodName) {
				return function() {
					return classWrapper.callMethod(methodName,
							argumentsToArray(arguments));
				};
			}
			};
		} else {
			return null;
		}
	};

	this.setTracing = function(enable) {
		classLoader.setTracing((enable) ? true : false);
	};
}

art_semanticturkey.JavaFirefoxSTBridge.doIt = function() {
	// var focusedWindow = document.commandDispatcher.focusedWindow;
	alert(window._content.getSelection() + "\n"
			+ window._content.document.location.href);
	// var viewsource = window._content.document.body;

	// alert(focusedWindow);
};

art_semanticturkey.JavaFirefoxSTBridge.googleAPI = function(query) {
	try {
		var bridge = this.getSemanticTurkey();

		var test = bridge.wrappedJSObject.getTest();
		// test.count();

		// alert(test.googleAPI(query));
		// window.content.document.close();
		window.content.document.open();
		window.content.document.write(test.googleAPI(query));
		window.content.document.close();
	} catch (e) {
		this._fail(e);
	}
};

art_semanticturkey.JavaFirefoxSTBridge.getOntology = function() {
	try {
		var bridge = this.getSemanticTurkey();

		var test = bridge.wrappedJSObject.getTest();
		// return test.getOntology();

	} catch (e) {
		this._fail(e);
	}
};

art_semanticturkey.JavaFirefoxSTBridge.getSemanticTurkey = function() {
	return Components.classes["@art.uniroma2.it/semanticturkey;1"]
	                          .getService(Components.interfaces.nsISemanticTurkey);
};

art_semanticturkey.JavaFirefoxSTBridge._trace = function(msg) {
	Components.classes["@mozilla.org/consoleservice;1"]
	                   .getService(Components.interfaces.nsIConsoleService)
	                   .logStringMessage(msg);
};

art_semanticturkey.JavaFirefoxSTBridge._fail = function(e) {
	var msg;
	if (e.getMessage) {
		msg = e + ": " + e.getMessage() + "\n";
		while (e.getCause() != null) {
			e = e.getCause();
			msg += "caused by " + e + ": " + e.getMessage() + "\n";
		}
	} else {
		msg = e;
	}
	alert(msg);
};



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
	if(stIsStarted=="true"){
		document.getElementById("startSt").disabled = true;
		//document.getElementById("key_openSTOntologySidebar").disabled = false;
		//document.getElementById("key_openSTImportsSidebar").disabled = false;
		//document.getElementById("key_openSTSKOSSidebar").disabled = false;
		//document.getElementById("SPARQL").disabled = false;
		//document.getElementById("visualization").disabled = false;
		//document.getElementById("visualization2").disabled = false;
		document.getElementById("projects_ST_Menu").disabled = false;
		document.getElementById("manage_all_projects").disabled = false;
		
	}
};
art_semanticturkey.SPARQL = function() {
	art_semanticturkey.openUrl("chrome://semantic-turkey/content/sparql/sparql.xul");
};

art_semanticturkey.semnavigation = function() {
	var isHumanReadable = art_semanticturkey.Preferences.get("extensions.semturkey.skos.humanReadable", false);
	
	var serverip = art_semanticturkey.Preferences.get("extensions.semturkey.server.ip", "127.0.0.1");
	var serverport = art_semanticturkey.Preferences.get("extensions.semturkey.server.port", "1979");
	//art_semanticturkey.openUrl("http://127.0.0.1:1979/semantic_turkey/resources/graph.html");
	var graphURL = "http://" + serverip + ":" + serverport + "/semantic_turkey/resources/graph.html?humanReadable=" + isHumanReadable + "&lang=" + encodeURIComponent(art_semanticturkey.Preferences.get("extensions.semturkey.annotprops.defaultlang" ,"en"));
	art_semanticturkey.Logger.debug("opening graph url: " + graphURL);
	art_semanticturkey.openUrl(graphURL);
};

art_semanticturkey.chk_SaveCurrentProjectMenuitem = function(){
	var isContinuosEditing = art_semanticturkey.CurrentProject.isContinuosEditing();
	if (isContinuosEditing == true)
		document.getElementById("save_project").disabled = true;
	else
		document.getElementById("save_project").disabled = false;
}

art_semanticturkey.save_project = function() {
	try{
		art_semanticturkey.STRequests.Projects.saveProject();
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.save_as_project = function() {
	var parameters = new Object();
	parameters.savedAsProject = false;
	parameters.newProjectName = "";
	
	window.openDialog(
			"chrome://semantic-turkey/content/projects/saveAsProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);

};

art_semanticturkey.export_project = function() {
	var parameters = new Object();
	
	window.openDialog(
			"chrome://semantic-turkey/content/projects/exportProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.manage_all_projects = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	window.openDialog(
		"chrome://semantic-turkey/content/projects/manageProjects.xul",
		"_blank", "chrome,dependent,dialog,modal=yes,resizable,centerscreen", parameters);
	/*parameters.properClose = false;
	while(parameters.properClose == false) {
		window.openDialog(
			"chrome://semantic-turkey/content/projects/manageProjects.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	}*/
};

art_semanticturkey.enableSTToolbarButtons = function(){
	document.getElementById("startSTToolBarButton").hidden = true;
	document.getElementById("prjManagementToolBarButton").hidden = false;
	/*document.getElementById("ontPanelToolBarButton").hidden = false;	
	document.getElementById("importsToolBarButton").hidden = false;
	document.getElementById("SPARQLToolBarButton").hidden = false;
	var isDefaultSet = art_semanticturkey.Preferences.get("extensions.semturkey.isDefaultSet", false);
	var defaultProjectOntType = art_semanticturkey.Preferences.get("extensions.semturkey.defaultProjectOntType", "null");
	if(isDefaultSet == true && defaultProjectOntType.indexOf("SKOS") != -1)	
		document.getElementById("SKOSToolBarButton").hidden = false;
	else
		document.getElementById("SKOSToolBarButton").hidden = true;
	*/
};

art_semanticturkey.startSTServer = function(){
	document.getElementById("startSTToolBarButton").disabled = true;
	art_semanticturkey.JavaFirefoxSTBridge.initialize();
	art_semanticturkey.startST();
};

/*
art_semanticturkey.restartFirefox = function(){
	var nsIAppStartup = Components.interfaces.nsIAppStartup;
	Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup).quit(
			nsIAppStartup.eForceQuit | nsIAppStartup.eRestart);
};*/

art_semanticturkey.associateEventsOnBrowserGraphicElements = function() {
	document.getElementById("menu_ToolsPopup").addEventListener("popupshowing",art_semanticturkey.chkST_started,true);
	//document.getElementById("startSt").addEventListener("command",art_semanticturkey.JavaFirefoxSTBridge.initialize,true);
	document.getElementById("startSt").addEventListener("command",art_semanticturkey.startSTServer,true);
	document.getElementById("key_openSTOntologySidebar").addEventListener("command",art_semanticturkey.toggleSidebar1,true);
	document.getElementById("key_openSTImportsSidebar").addEventListener("command",art_semanticturkey.toggleSidebar2,true);
	document.getElementById("key_openSTSKOSSidebar").addEventListener("command",art_semanticturkey.toggleSidebar3,true);
	document.getElementById("SPARQL").addEventListener("command",art_semanticturkey.SPARQL,true);
	/*document.getElementById("sidebar_openSageSidebar").addEventListener("command",art_semanticturkey.toggleSidebar1,true);
	document.getElementById("sidebar_openSageSidebar2").addEventListener("command",art_semanticturkey.toggleSidebar2,true);*/
	document.getElementById("mode_normal").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionNormal,true);
	document.getElementById("mode_debug").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionDebug,true);
	/*document.getElementById("sidebar_normal").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionNormal,true);
	document.getElementById("sidebar_debug").addEventListener("command",art_semanticturkey.ContexMenu.visualizationOptionDebug,true);*/
	document.getElementById("export_repository").addEventListener("command",art_semanticturkey.ContexMenu.exportRepository,true);
	document.getElementById("load_repository").addEventListener("command",art_semanticturkey.ContexMenu.loadRdf,true);
	document.getElementById("clear_repository").addEventListener("command",art_semanticturkey.ContexMenu.clearRepository,true);
	document.getElementById("mirror_ontologies").addEventListener("command",art_semanticturkey.ContexMenu.manageOntologyMirror,true);
	document.getElementById("status-bar-annotation").addEventListener("click",art_semanticturkey.viewAnnotationOnPage,true);
	document.getElementById("status-bar-bookmark").addEventListener("click",art_semanticturkey.openBookmarksDialog,true);

	//Projects menu
	document.getElementById("save_project").addEventListener("command",art_semanticturkey.save_project,true);
	document.getElementById("save_as_project").addEventListener("command",art_semanticturkey.save_as_project,true);
	document.getElementById("export_project").addEventListener("command",art_semanticturkey.export_project,true);
	document.getElementById("manage_all_projects").addEventListener("command",art_semanticturkey.manage_all_projects,true);
	document.getElementById("projects_menu_ToolsPopup").addEventListener("popupshowing",art_semanticturkey.chk_SaveCurrentProjectMenuitem,true);
	
	//sd-toolbar
	document.getElementById("startSTToolBarButton").addEventListener("command",art_semanticturkey.startSTServer,true);
	document.getElementById("prjManagementToolBarButton").addEventListener("command",art_semanticturkey.manage_all_projects,true);
	document.getElementById("ontPanelToolBarButton").addEventListener("command",art_semanticturkey.toggleSidebar1,true);
	document.getElementById("importsToolBarButton").addEventListener("command",art_semanticturkey.toggleSidebar2,true);	
	document.getElementById("SPARQLToolBarButton").addEventListener("command",art_semanticturkey.SPARQL,true);
	document.getElementById("SKOSToolBarButton").addEventListener("command",art_semanticturkey.toggleSidebar3,true);
	document.getElementById("graphBarButton").addEventListener("command",art_semanticturkey.semnavigation,true);
	
	document.getElementById("humanReadableButton").addEventListener("command",art_semanticturkey.humanReadableButtonClick,true);
	document.getElementById("humanReadableButton").prefListener = new art_semanticturkey.PrefListener("extensions.semturkey.skos.", function(branch, name) {
		if (name == "humanReadable") {
			var isReadable = branch.getBoolPref(name);
			
			document.getElementById("humanReadableButton").checked = isReadable;
		}
	}); // The listener is prevented from being garbage collected, by attaching it to the button
	document.getElementById("humanReadableButton").prefListener.register(true); // true causes the callback to be invoked on registration	

	
	var stIsStarted = art_semanticturkey.ST_started.getStatus();
	
	art_semanticturkey.eventListenerBrowserOverlayArrayObject = new art_semanticturkey.eventListenerArrayClass();
	
	if(stIsStarted=="true"){
		art_semanticturkey.enableSTToolbarButtons();
	}else{
		art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("st_started", art_semanticturkey.enableSTToolbarButtons, null);
	}
	
	//Adding an three ojbects waiting for the events projectOpened , projectClosed and projectChangedName
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("projectOpened", art_semanticturkey.changeProjectObj, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("projectClosed", art_semanticturkey.changeProjectObj, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("projectChangedName", art_semanticturkey.changeProjectObj, null);
	
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("projectOpened", art_semanticturkey.enableDropOnBrowser, null);
	art_semanticturkey.eventListenerBrowserOverlayArrayObject.addEventListenerToArrayAndRegister("projectClosed", art_semanticturkey.disableDropOnBrowser, null);

	
	/*var projectOpened = new art_semanticturkey.changeProjectObj();
	art_semanticturkey.evtMgr.registerForEvent("projectOpened",projectOpened);
	var projectClosed = new art_semanticturkey.changeProjectObj();
	art_semanticturkey.evtMgr.registerForEvent("projectClosed",projectClosed);
	var projectChangedName = new art_semanticturkey.changeProjectObj();
	art_semanticturkey.evtMgr.registerForEvent("projectChangedName",projectChangedName);*/
	
	
	
	//Adding an observer for the closing of firefox and for its restart
	var observerService = Components.classes["@mozilla.org/observer-service;1"]
	                                        .getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(new art_semanticturkey.myObserverFirefoxClosed(), "quit-application-requested", false); //close
	observerService.addObserver(new art_semanticturkey.myObserverFirefoxClosed(), "quit-application", false); // restart	                                        
};

art_semanticturkey.myObserverFirefoxClosed = function(){
	this.observe = function(){
		var sidebarWindow = document.getElementById("sidebar").contentWindow;
		var locHref = sidebarWindow.location.href;
		if((locHref == "chrome://semantic-turkey/content/metadata/imports.xul") || 
			(locHref == "chrome://semantic-turkey/content/tabs.xul") || ("chrome://semantic-turkey/content/skos/tabs.xul")){
				toggleSidebar();
		}
		var isContinuosEditing = art_semanticturkey.CurrentProject.isContinuosEditing();
		var isNull = art_semanticturkey.CurrentProject.isNull();
		if(isNull == false && isContinuosEditing == false){
			var currentProectName = art_semanticturkey.CurrentProject.getProjectName();
			var risp = confirm("Save project "+currentProectName+ "?");
			if(risp)
				art_semanticturkey.save_project();
		}
	};
};

art_semanticturkey.changeProjectObj = function(eventId, projectInfo) {
	if(eventId == "projectOpened"){
		var projectName = projectInfo.getProjectName();
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName("broadcaster");
		for(var i=0; i<broadcasterList.length; ++i){
			if(broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true"){
				var label = broadcasterList[i].getAttribute("label");
				broadcasterList[i].setAttribute("sidebartitle", label + " ( " + projectName+" )");
			}
		}
		document.getElementById("ontPanelToolBarButton").hidden = false;	
		document.getElementById("importsToolBarButton").hidden = false;
		document.getElementById("SPARQLToolBarButton").hidden = false;
		document.getElementById("graphBarButton").hidden = false;
		document.getElementById("save_project").setAttribute("label", "Save "+projectName);
		if(art_semanticturkey.CurrentProject.isContinuosEditing() == false)
			document.getElementById("save_project").disabled = false;
		document.getElementById("save_as_project").setAttribute("label", "Save "+projectName+" as ...");
		document.getElementById("save_as_project").disabled = false;
		document.getElementById("export_project").setAttribute("label", "Export "+projectName);
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
		if(projectInfo.getType().indexOf("SKOS") != -1){
			document.getElementById("SKOSToolBarButton").hidden = false;
			document.getElementById("key_openSTSKOSSidebar").hidden = false;
			document.getElementById("key_openSTSKOSSidebar").disabled = false;
			document.getElementById("humanReadableButton").hidden = false;
			
			if (typeof art_semanticturkey.skosStateManagemenet.stEventArray != "undefined") {
				art_semanticturkey.skosStateManagemenet.stEventArray.deregisterAllListener();	
			}

			art_semanticturkey.skosStateManagemenet.selectedScheme = art_semanticturkey.STRequests.Projects.getProjectProperty("skos.selected_scheme", null).getElementsByTagName("property")[0].getAttribute("value");		

			art_semanticturkey.skosStateManagemenet.stEventArray = new art_semanticturkey.eventListenerArrayClass();
			art_semanticturkey.skosStateManagemenet.stEventArray
				.addEventListenerToArrayAndRegister("resourceRenamed", art_semanticturkey.skosStateManagemenet.resourceRenamed);
			art_semanticturkey.skosStateManagemenet.stEventArray
				.addEventListenerToArrayAndRegister("skosSchemeRemoved", art_semanticturkey.skosStateManagemenet.schemeRemoved);
			art_semanticturkey.skosStateManagemenet.stEventArray
				.addEventListenerToArrayAndRegister("projectPropertySet", art_semanticturkey.skosStateManagemenet.projectPropertySet);
		}
		else{
			document.getElementById("SKOSToolBarButton").hidden = true;
			document.getElementById("key_openSTSKOSSidebar").hidden = true;
			document.getElementById("key_openSTSKOSSidebar").disabled = true;
			document.getElementById("humanReadableButton").hidden = true;
		}
	}
	else if(eventId == "projectClosed"){
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName("broadcaster");
		for(var i=0; i<broadcasterList.length; ++i){
			if(broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true"){
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
	}
	else if(eventId == "projectChangedName"){
		var projectName = projectInfo.projectName;
		var broadcasterList = document.getElementById("mainBroadcasterSet").getElementsByTagName("broadcaster");
		for(var i=0; i<broadcasterList.length; ++i){
			if(broadcasterList[i].getAttribute("semanticTurkeyBroadcaster") == "true"){
				var label = broadcasterList[i].getAttribute("label");
				broadcasterList[i].setAttribute("sidebartitle", label + " ( " + projectName+" )");
				if(broadcasterList[i].getAttribute("checked") == "true"){
					document.getElementById('sidebar-title').value = label + " ( " + projectName+" )";
				}
			}
		}
		document.getElementById("save_project").setAttribute("label", "Save "+projectName);
		document.getElementById("save_as_project").setAttribute("label", "Save "+projectName+" as ...");
		document.getElementById("export_project").setAttribute("label", "Export "+projectName);
	}
};


window.addEventListener("load",
		art_semanticturkey.associateEventsOnBrowserGraphicElements, true);

art_semanticturkey.enableDropOnBrowser = function(eventId, projectOpenedObj) {
	gBrowser.addEventListener("drop", art_semanticturkey.dropOnBrowser, true);
	gBrowser.addEventListener("dragover", art_semanticturkey.dragOverBrowser, true);
};

art_semanticturkey.disableDropOnBrowser = function(eventId, projectOpenedObj) {
	gBrowser.removeEventListener("drop", art_semanticturkey.dropOnBrowser, true);
	gBrowser.removeEventListener("dragover", art_semanticturkey.dragOverBrowser, true);
};

art_semanticturkey.dragOverBrowser = function(event){
	if (event.dataTransfer.types.contains("application/skos.concept")) {
		event.preventDefault();
	}
};

art_semanticturkey.dropOnBrowser = function(event){
	if (event.dataTransfer.types.contains("application/skos.concept")) {
		event.preventDefault();
		
		try{
			var doc = event.target.ownerDocument;
			var urlPage = doc.documentURI;
			var title = doc.title;
			var topics = [event.dataTransfer.getData("application/skos.concept")];

			var topicCollection = art_semanticturkey.STRequests.Annotation.bookmarkPage(urlPage, title, topics);			
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
		art_semanticturkey.STRequests.Projects.setProjectProperty("skos.selected_scheme", newName);
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