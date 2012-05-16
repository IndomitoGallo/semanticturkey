if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("cloneProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
	document.getElementById("projectName").value = window.arguments[0].projectName;
	document.getElementById("projectName").disabled = true;
	
	document.getElementById("clonedProjectName").focus();
};



art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	var projectName = document.getElementById("projectName").value;
	var clonedProjectName = document.getElementById("clonedProjectName").value;
	var currentProject = art_semanticturkey.CurrentProject.getProjectName();
	var currentProjectType = art_semanticturkey.CurrentProject.getType();
	var currentProjectOntoType = art_semanticturkey.CurrentProject.getOntoType();
	var parentWindow = window.arguments[0].parentWindow;
	
	if(clonedProjectName == ""){
		alert("Please specify a name for the cloned project ");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	
	if(projectName == currentProject){
		parentWindow.art_semanticturkey.closeProject();
	}
	
	try{
		var responseXML = art_semanticturkey.STRequests.Projects.cloneProject(
			projectName,
				clonedProjectName);
		art_semanticturkey.cloneProject_RESPONSE(responseXML, projectName, currentProject, currentProjectType, currentProjectOntoType);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
		if(projectName == currentProject){
			art_semanticturkey.STRequests.Projects.openProject(projectName);
			art_semanticturkey.CurrentProject.setCurrentProjet(currentProject, false, currentProjectType, currentProjectOntoType);
		}
	}
};

art_semanticturkey.cloneProject_RESPONSE = function(responseElement, projectName, currentProject, currentProjectType, currentProjectOntoType){
	window.arguments[0].clonedProject = true;
	if(projectName == currentProject){
		art_semanticturkey.STRequests.Projects.openProject(projectName);
		art_semanticturkey.CurrentProject.setCurrentProjet(currentProject, false, currentProjectType, currentProjectOntoType);
	}
	close();
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("cloneProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
};