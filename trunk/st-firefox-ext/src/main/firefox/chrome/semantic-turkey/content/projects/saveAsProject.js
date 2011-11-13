if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("saveAsProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("newProjectName").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
	document.getElementById("oldProjectName").value = art_semanticturkey.CurrentProject.getProjectName();
	
	document.getElementById("newProjectName").focus();
};



art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	var projectName = document.getElementById("newProjectName").value;
	if(projectName == ""){
		alert("Please specify a Project Name");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	try{
		var responseXML = art_semanticturkey.STRequests.Projects.saveProjectAs(
			projectName);
		art_semanticturkey.saveAsProject_RESPONSE(responseXML, projectName);
	}
	catch (e) {
		var projectInfo = art_semanticturkey.getCurrentProjectFromServer();
		try{
			if(projectInfo.isNull == true){
				var oldProjectName = art_semanticturkey.CurrentProject.getProjectName();
				//var oldProjectIsMain = art_semanticturkey.CurrentProject.isMainProject();
				var oldProjectType = art_semanticturkey.CurrentProject.getType();
				var responseXML = art_semanticturkey.STRequests.Projects.openProject(
					projectName);
				art_semanticturkey.openProject_RESPONSE(responseXML, oldProjectName, oldProjectIsMain, oldProjectType);
				
			}
		}
		catch (e) {
			alert(e.name + ": " + e.message);
			art_semanticturkey.DisabledAllButton(false);
		}
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.openProject_RESPONSE = function(responseElement, projectName, type){
	art_semanticturkey.CurrentProject.setCurrentProjet(projectName, false, type);
};

art_semanticturkey.saveAsProject_RESPONSE = function(responseElement, newProjectName){
	if(responseElement.isFail()){
		alert(responseElement.getElementsByTagName("reply")[0].textContent);
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	window.arguments[0].savedAsProject = true;
	window.arguments[0].newProjectName = newProjectName;
	art_semanticturkey.CurrentProject.setCurrentNameProject(newProjectName);
	close();
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("saveAsProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
};