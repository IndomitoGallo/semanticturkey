Components.utils.import("resource://stmodules/Logger.jsm");
Components.utils.import("resource://stmodules/Preferences.jsm");
Components.utils.import("resource://stmodules/stEvtMgr.jsm");

EXPORTED_SYMBOLS = ["CurrentProject"];

CurrentProject = new function(){
	var id = "no project currently active";
	var isNull = true; // boolean value
	var isContinuosEditing = true; // boolean value
	var type;
	var ontoType;
	
	this.setCurrentProjet = function(projectName, isNullProject, projectType, ontologyType){
		id = projectName;
		isNull = isNullProject;
		type = projectType;
		if(type == "continuosEditing")
			isContinuosEditing = true;
		else
			isContinuosEditing = false;
			
		ontoType = ontologyType;
	};
	
	this.setCurrentNameProject = function(projectName){
		id = projectName;
		var projectInfo = new Object();
		projectInfo.projectName = projectName;
		evtMgr.fireEvent("projectChangedName", projectInfo);
	};
	
	this.getProjectName = function(){
		return id;
	};
	
	this.isNull = function(){
		return isNull;
	};
	
	this.isContinuosEditing = function(){
		return isContinuosEditing;
	};
	
	this.getType = function(){
		return type;
	};
	
	this.getOntoType = function(){
		return ontoType;
	};
};