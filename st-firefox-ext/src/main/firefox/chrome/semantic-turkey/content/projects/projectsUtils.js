
//This file in never used
/*
Components.utils.import("resource://modules/ProjectST.jsm", art_semanticturkey);

art_semanticturkey.getCurrentProjectId = function(mainWindow){
	var current_project_idMenuitem = mainWindow.document.getElementById("current_project_id");
	return current_project_idMenuitem.label;
}

art_semanticturkey.getCurrentProjectType = function(mainWindow){
	var current_project_idMenuitem = mainWindow.document.getElementById("current_project_id");
	var isTypeContinuosEditing = current_project_idMenuitem.getAttribute("isContinuosEditing");
	if (isTypeContinuosEditing == true){
		return "continuosEditing";
	}
	else
		return "saveToStore";
}

art_semanticturkey.setCurrentProject = function(mainWindow, projectName, isNull, isMainProject, projectType){
	var current_project_idMenuitem = mainWindow.document.getElementById("current_project_id");
	current_project_idMenuitem.label = projectName;
	current_project_idMenuitem.setAttribute("isNull", isNull);
	current_project_idMenuitem.setAttribute("isMainProject", isMainProject);
	alert("dentro setCurrentProject e projectType = "+projectType);
	if(projectType == "continuosEditing")
		current_project_idMenuitem.setAttribute("isContinuosEditing", "true");
	else
		current_project_idMenuitem.setAttribute("isContinuosEditing", "false");
	alert("dentro setCurentProject dopo set e vale = "+mainWindow.document.getElementById("current_project_id").getAttribute("isContinuosEditing"));
};
*/