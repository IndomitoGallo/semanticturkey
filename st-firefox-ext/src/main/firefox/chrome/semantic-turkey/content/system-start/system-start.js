if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/SemTurkeyHTTP.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Exceptions.jsm", art_semanticturkey);

/**
 * this is the entry point for Semantic Turkey Initialization this function asks
 * ST to start
 * 
 * 
 * @return
 */
art_semanticturkey.startST = function() {
	// art_semanticturkey.JavaFirefoxSTBridge.initialize();
	art_semanticturkey.Logger.debug("entering startST");

	var responseXML = null;
	try {
		responseXML = art_semanticturkey.STRequests.Projects.getCurrentProject();
	} catch (e) {
		if (e instanceof art_semanticturkey.HTTPError) {
			alert("no server found! pls check that a server is listening on: "
					+ art_semanticturkey.HttpMgr.getAuthority());
			return;	// Leave ST unstarted
		} // Otherwise, the server is on but no project has been loaded yet
	}
	
	// Here we know that ST is listening
	art_semanticturkey.ST_started.setStatus();
	art_semanticturkey.registerAnnotationFamilies();	// Should we place this initialization elsewhere?

	if (responseXML != null) {
		var projectElement = responseXML.getElementsByTagName("project")[0];
		var projectName = responseXML.textContent;
		var type = projectElement.getAttribute("type");
		var ontoType = projectElement.getAttribute("ontoType");
		
		art_semanticturkey.openDefProject_RESPONSE2(projectName, type, ontoType);
	} else { // No project is open, let the user choose one
		art_semanticturkey.chose_a_projects();
	}
};

art_semanticturkey.chose_a_projects = function() {
	var parameters = new Object();
	parameters.parentWindow = window;

	window.openDialog("chrome://semantic-turkey/content/projects/manageProjects.xul", "_blank",
			"modal=yes,resizable,centerscreen", parameters);
};

art_semanticturkey.openDefProject_RESPONSE = function(responseElement, projectName, ontoType) {
	var type = responseElement.getElementsByTagName("type")[0].textContent;
	art_semanticturkey.openDefProject_RESPONSE2(projectName, type, ontoType);
};

art_semanticturkey.openDefProject_RESPONSE2 = function(projectName, type, ontoType) {
	art_semanticturkey.CurrentProject.setCurrentProjet(projectName, false, type, ontoType);
	art_semanticturkey.projectOpened(projectName, ontoType);
};
