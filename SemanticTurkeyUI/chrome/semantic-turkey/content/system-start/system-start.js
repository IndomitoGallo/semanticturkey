if (typeof art_semanticturkey == 'undefined')
	var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Preferences.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);


/**
 * this is the entry point for Semantic Turkey Initialization this function asks ST to start
 * 
 * 
 * @return
 */
art_semanticturkey.startST = function() {
	art_semanticturkey.Logger.debug("entering startST");
	try{
		//TODO the DEBUG in this function should be removed once it is all tested
		var isDefaultSet = art_semanticturkey.Preferences.get("extensions.semturkey.isDefaultSet", false);
                art_semanticturkey.Logger.debug("BrZ- debug a1");
		var defaultProjectName = art_semanticturkey.Preferences.get("extensions.semturkey.defaultProjectName", "null");
                art_semanticturkey.Logger.debug("BrZ- debug a2");
		var defaultProjectOntType = art_semanticturkey.Preferences.get("extensions.semturkey.defaultProjectOntType", "null");
                art_semanticturkey.Logger.debug("BrZ- debug a3");
		
		if(isDefaultSet == true){
                    art_semanticturkey.Logger.debug("BrZ- debug b");
			art_semanticturkey.closeProject(); // This function here it is used to inform that ST is about to change project
			var responseXML = art_semanticturkey.STRequests.Projects.openProject(defaultProjectName);
			art_semanticturkey.openDefProject_RESPONSE(responseXML, defaultProjectName, defaultProjectOntType);
		}
		else{
                    art_semanticturkey.Logger.debug("BrZ- debug c");
			art_semanticturkey.chose_a_projects();
		}
		art_semanticturkey.evtMgr.fireEvent("st_started");
	}
	catch (e) {
		var isDefaultSet = art_semanticturkey.Preferences.set("extensions.semturkey.isDefaultSet", false);
		var defaultProjectName = art_semanticturkey.Preferences.set("extensions.semturkey.defaultProjectName", "null");
		var defaultProjectOntType = art_semanticturkey.Preferences.set("extensions.semturkey.defaultProjectOntType", "null");
		art_semanticturkey.Logger.debug("catch di startST = "+e.name + ": " + e.message);
		art_semanticturkey.chose_a_projects();
		art_semanticturkey.evtMgr.fireEvent("st_started");
	}
	art_semanticturkey.Logger.debug("just after the http request=start");
};

art_semanticturkey.chose_a_projects = function() {
	var parameters = new Object();
	parameters.parentWindow = window;
	
	
	window.openDialog(
		"chrome://semantic-turkey/content/projects/manageProjects.xul",
		"_blank", "modal=yes,resizable,centerscreen", parameters);
};


art_semanticturkey.openDefProject_RESPONSE = function(responseElement, projectName, ontoType) {
	var type =responseElement.getElementsByTagName("type")[0].textContent;
	art_semanticturkey.CurrentProject.setCurrentProjet(projectName, false, type);
	art_semanticturkey.projectOpened(projectName, ontoType);
};


