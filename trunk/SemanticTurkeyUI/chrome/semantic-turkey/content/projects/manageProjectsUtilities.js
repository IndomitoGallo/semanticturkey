if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);


art_semanticturkey.closeProject = function(){
	try{
		var isContinuosEditing = art_semanticturkey.CurrentProject.isContinuosEditing();
		var isNull = art_semanticturkey.CurrentProject.isNull();
		var currentProectName = art_semanticturkey.CurrentProject.getProjectName();
		art_semanticturkey.projectClosed(currentProectName); 
		if((isNull == false) && (isContinuosEditing == false)){
			var risp = confirm("Save project "+currentProectName+ "?");
			var parentWindow = window.arguments[0].parentWindow;
			if(risp)
				parentWindow.art_semanticturkey.save_project();
		}
		art_semanticturkey.CurrentProject.setCurrentProjet("no project currently active", true, false, "nullProject");
		var responseXML = art_semanticturkey.STRequests.Projects.closeProject();
		art_semanticturkey.closeProject_RESPONSE(responseXML, currentProectName);
	}
	catch (e) {
		art_semanticturkey.Logger.debug("Catch in closeProject: "+e.name + ": " + e.message);
		//alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.closeProject_RESPONSE = function(responseElement, projectName){
	//art_semanticturkey.CurrentProject.setCurrentProjet("no project currently active", true, false, "nullProject");
};

art_semanticturkey.getCurrentProjectFromServer = function(){
	try{
		var responseXML = art_semanticturkey.STRequests.Projects.getCurrentProject();
		return art_semanticturkey.getCurrentProject_RESPONSE(responseXML);
	}
	catch(e){
		return null;
	}
};

art_semanticturkey.getCurrentProject_RESPONSE = function(responseElement){
	var projectInfo = new Object();
	if(responseElement.getElementsByTagName("exists")[0]){
		projectInfo.isNull = true;
		projectInfo.projectName = "";
	}
	else {
		projectInfo.isNull = false;
		projectInfo.projectName = responseElement.getElementsByTagName("project")[0].textContent;
	}
	return projectInfo;
};

//These two function send the events of project
art_semanticturkey.projectOpened = function(newProject){
	var projectInfo = new Object();
	projectInfo.projectName = newProject;
	art_semanticturkey.evtMgr.fireEvent("projectOpened", projectInfo);
};

//These two function sends the events of project
art_semanticturkey.projectClosed = function(oldProject){
	var projectInfo = new Object();
	projectInfo.projectName = oldProject;
	art_semanticturkey.evtMgr.fireEvent("projectClosed", projectInfo);
};


