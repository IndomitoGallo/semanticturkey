if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);


/**
 * this is the entry point for Semantic Turkey Initialization this function asks ST to start. If the response
 * is negative, then a baseuri and a default namespace need to be prompted by the user
 * 
 * @author NScarpato 28/04/2008 startST
 * 
 * @return
 */
art_semanticturkey.startST = function() {
	art_semanticturkey.Logger.debug("entering startST");
	try{
		var isLastProjMain = art_semanticturkey.Preferences.get("extensions.semturkey.isLastProjMain", false);
		//var firstStart = art_semanticturkey.Preferences.get("extensions.semturkey.firstStart", true);
		art_semanticturkey.Preferences.set("extensions.semturkey.firstStart", false);
		if(isLastProjMain == true){ // || firstStart == true){
			art_semanticturkey.closeProject(); // This function here it is used to inform that ST is about to change project
			var responseXML = art_semanticturkey.STRequests.SystemStart.start();
			art_semanticturkey.startST_RESPONSE(responseXML, false);
		}
		else{
			art_semanticturkey.chose_a_projects();
		}
		art_semanticturkey.evtMgr.fireEvent("st_started");
	}
	catch (e) {
		art_semanticturkey.Logger.debug("catch di startST = "+e.name + ": " + e.message);
	}
	art_semanticturkey.Logger.debug("just after the http request=start");
};

art_semanticturkey.chose_a_projects = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.properClose = false;
	
	/*var win = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
					.getService(Components.interfaces.nsIWindowWatcher);*/
	while(parameters.properClose == false) {
		window.openDialog(
			"chrome://semantic-turkey/content/projects/manageProjects.xul",
			"_blank", "modal=yes,resizable,centerscreen, close=no", parameters);
		/*win.openWindow(null, "chrome://semantic-turkey/content/projects/manageProjects.xul",
					"initialize", "chrome,modal,centerscreen", parameters);*/
	}
};


/**
 * 
 * 
 * @return
 */
art_semanticturkey.startST_RESPONSE = function(responseElement, canBeClosed) {

	art_semanticturkey.Logger.debug("start of startST_RESPONSE()");
	art_semanticturkey.Logger.debug("xmlResponseContent:\n"
			+ art_semanticturkey.HttpMgr.parseXMLSource(responseElement));
	try {
		var dataElement = responseElement.getElementsByTagName('data')[0];
		var status = responseElement.getElementsByTagName('reply')[0].getAttribute("status");
		if (status == "ok"){
			art_semanticturkey.CurrentProject.setCurrentProjet("Main Project", false, true, "continuosEditing");
			art_semanticturkey.projectOpened("Main Project");
		}
		else if (status == "fail") {
			var parameters = new Object();
			parameters.baseuri_state = dataElement.getElementsByTagName('baseuri')[0].getAttribute("state");
			parameters.repImpl_state = dataElement.getElementsByTagName('ontmanager')[0].getAttribute("state");
			parameters.baseuri = dataElement.getElementsByTagName('baseuri')[0].getAttribute("uri");
			parameters.repositoryImplementation = dataElement.getElementsByTagName('ontmanager')[0].getAttribute("id");
			parameters.properClose = false;
			parameters.canBeClosed = canBeClosed;
			
			art_semanticturkey.Logger.debug("id = "
					+ dataElement.getElementsByTagName('ontmanager')[0].getAttribute("id"));
			
			
			while (parameters.properClose == false) {
				window.openDialog(
					"chrome://semantic-turkey/content/system-start/initialize.xul",
					"_blank", "modal=yes,resizable,centerscreen, close=no", parameters);
			}
		} else if ((status != "ok") && (status != 'warning')) {
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
			if (status)
				prompts.alert(null, "Server Communication Error",
						"[system-start.js] incoherent state from server; actual state: "
								+ parameters.resp_state);
			else
				prompts.alert(null, "Server Communication Error",
						"[system-start.js] state not available from server: ");
		}
	} catch (e) {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		prompts.alert(null, "bad response from the server",
				"Semantic Turkey service did not reply in un understandable manner. The following error:\n"
						+ e + "\ncannot be solved by the user. Please submit your problem to the authors");
	}
	;
};


