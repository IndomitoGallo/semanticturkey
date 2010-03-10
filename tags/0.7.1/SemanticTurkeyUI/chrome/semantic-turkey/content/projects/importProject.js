if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);

window.onload = function(){
	document.getElementById("dirBtn").addEventListener("click", art_semanticturkey.chooseFile, true);
	document.getElementById("importProject").addEventListener("click", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("click", art_semanticturkey.cancel, true);
	
	document.getElementById("projectName").focus();
};


art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	var srcLocalFile = document.getElementById("srcLocalFile").value;
	var projectName = document.getElementById("projectName").value;
	if((projectName == "") || (srcLocalFile == "")){
		alert("Please specify a file and a name for the project");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	try{
		window.arguments[0].parentWindow.art_semanticturkey.closeProject();
		var responseXML = art_semanticturkey.STRequests.Projects.importProject(
				srcLocalFile,
				projectName);
		art_semanticturkey.importProject_RESPONSE(responseXML, projectName);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.importProject_RESPONSE = function(responseElement, projectName){
	window.arguments[0].importedProject = true;
	window.arguments[0].newProjectName = projectName;
	
	try{
		var responseXML = art_semanticturkey.STRequests.Projects.listProjects();
		window.arguments[0].newProjectType = art_semanticturkey.getProjectType(projectName, responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
	close();
};

art_semanticturkey.getProjectType = function(projectId, responseElement){
	var projects = responseElement.getElementsByTagName("project");
	
	for (var i = 0; i < projects.length; i++) {
		var projectName = projects[i].textContent;
		if(projectId == projectName){
			return projects[i].getAttribute("type");
		}
	}
	return null;
}

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("importProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
	document.getElementById("dirBtn").disabled = disabled;
};