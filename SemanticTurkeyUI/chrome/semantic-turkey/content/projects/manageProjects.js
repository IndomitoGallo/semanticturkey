
if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};
Components.utils.import("resource://stservices/SERVICE_Projects.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ProjectST.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/stEvtMgr.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("projects-main-window").setAttribute("title", "Projects Management ( "
		+ art_semanticturkey.CurrentProject.getProjectName() +" )");
	
	document.getElementById("openProject").addEventListener("command", art_semanticturkey.openProject, true);
	document.getElementById("openMainProject").addEventListener("command", art_semanticturkey.openMainProject, true);
	document.getElementById("imporProject").addEventListener("command", art_semanticturkey.importProject, true);
	document.getElementById("newProject").addEventListener("command", art_semanticturkey.newProject, true);
	document.getElementById("newProjectFromFile").addEventListener("command", art_semanticturkey.newProjectFromFile, true);
	document.getElementById("deleteProject").addEventListener("command", art_semanticturkey.deleteProject, true);
	document.getElementById("cloneProject").addEventListener("command", art_semanticturkey.cloneProject, true);
	document.getElementById("close").addEventListener("command", art_semanticturkey.close, true);
	
	document.getElementById("restartFirefox").addEventListener("command", art_semanticturkey.closeAndRestartFirefox, true);
		
	document.getElementById("projectsTree").addEventListener("dblclick",
			art_semanticturkey.openProject, true);
	
	art_semanticturkey.populateProjectsList();
};


art_semanticturkey.populateProjectsList = function(){
	try{
		var responseXML = art_semanticturkey.STRequests.Projects.listProjects();
		art_semanticturkey.getListProjects_RESPONSE(responseXML);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.getListProjects_RESPONSE = function(responseElement){
	var projects = responseElement.getElementsByTagName("project");
	var node = document.getElementById("ProjectsTreeChildren");
	
	//empty project tree
	while (node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
	
	for (var i = 0; i < projects.length; i++) {
		var projectName = projects[i].textContent;
		var projectTS = projects[i].getAttribute("ontmgr");
		if(projectTS != null)
			projectTS = projectTS.substring(projectTS.lastIndexOf('.') + 1);
		var status = projects[i].getAttribute("status");
		var type = projects[i].getAttribute("type");
		var ontoType = projects[i].getAttribute("ontoType");
		
		var tr = document.createElement("treerow");
		var tcName = document.createElement("treecell");
		tcName.setAttribute("label", projectName);
		tcName.setAttribute("typeProject", type);
		tr.appendChild(tcName);		
		
		var tcTS = document.createElement("treecell");
		tcTS.setAttribute("label", projectTS);
		tr.appendChild(tcTS);
		
		var tcTS = document.createElement("treecell");
		tcTS.setAttribute("label", type);
		tr.appendChild(tcTS);

		var tcTS = document.createElement("treecell");
		tcTS.setAttribute("label", ontoType);
		tr.appendChild(tcTS);
		
		var tcStatus = document.createElement("treecell");
		if(status != "ok") {
			tcStatus.setAttribute("src", "chrome://global/skin/checkbox/cbox-check.gif");
			tcStatus.setAttribute("hasIssues", "true");
		}
		else
			tcStatus.setAttribute("hasIssues", "false");
		tr.appendChild(tcStatus);
		
		var ti = document.createElement("treeitem");
		ti.appendChild(tr);

		node.appendChild(ti);
	}
	
	//check if there is a loaded project, so the user can exit this window using the close button
	if(art_semanticturkey.CurrentProject.isNull() == true){
		document.getElementById("close").disabled = true;
	}
	else{
		document.getElementById("close").disabled = false;
	}
};

art_semanticturkey.openProject= function(){
	if(document.getElementById("openMainProject").disabled == true){
		return;
	}
	
	var tree = document.getElementById("projectsTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Project, or use the openMain to open the main project");
		return;
	}
	var currentElement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentElement.getElementsByTagName('treerow')[0];
	var treecellName = treerow.getElementsByTagName('treecell')[0];
	var treecellStatus = treerow.getElementsByTagName('treecell')[2];
	var projectName = treecellName.getAttribute("label");
	var projectType = treecellName.getAttribute("typeProject");
	if(treecellStatus.getAttribute("hasIssues") == "true"){
		alert("The Project "+projectName+" could not be opened because it has some internal problems");
		return;
	}
	try{
		art_semanticturkey.DisabledAllButton(true);
		art_semanticturkey.closeProject(); // close the current project
		var responseXML = art_semanticturkey.STRequests.Projects.openProject(
				projectName);
		art_semanticturkey.openProject_RESPONSE(responseXML, projectName, false, projectType);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};


art_semanticturkey.openMainProject = function(){
	if(document.getElementById("openProject").disabled == true){
		return;
	}
	try{
		art_semanticturkey.closeProject(); // close the current project
		art_semanticturkey.DisabledAllButton(true);
		var responseXML = art_semanticturkey.STRequests.Projects.openMainProject(); // this can cause the exception
		art_semanticturkey.openProject_RESPONSE(responseXML, "Main Project", true, "continuosEditing");
	}
	catch (e) {
		//This should happen only when or the base uri or the ontManger are undefined
		art_semanticturkey.openMainProjectException();
		art_semanticturkey.DisabledAllButton(false);
	}
};


art_semanticturkey.openProject_RESPONSE = function(responseElement, projectName, isMainProject, type){
	art_semanticturkey.CurrentProject.setCurrentProjet(projectName, false, isMainProject, type);
	art_semanticturkey.properClose();
	art_semanticturkey.projectOpened(projectName);
};


art_semanticturkey.openMainProjectException = function(){
	try{
		var responseXML = art_semanticturkey.STRequests.SystemStart.start();
		art_semanticturkey.startST_RESPONSE(responseXML, true);
		if(art_semanticturkey.CurrentProject.isNull() == false)
			art_semanticturkey.properClose();
	}
	catch (e) {
		art_semanticturkey.openMainProjectException();
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
}


art_semanticturkey.importProject= function(){
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.importedProject = false;
	parameters.newProjectName = "";
	parameters.newProjectType = "";
	
	art_semanticturkey.DisabledAllButton(true);
	
	window.openDialog(
			"chrome://semantic-turkey/content/projects/importProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	
	art_semanticturkey.DisabledAllButton(false);
			
	if(parameters.importedProject == true){
		var newProjectName = parameters.newProjectName;
		var newProjectType = parameters.newProjectType;
		art_semanticturkey.CurrentProject.setCurrentProjet(newProjectName, false, false, newProjectType);
		art_semanticturkey.properClose();
		art_semanticturkey.projectOpened(newProjectName);
	}
};


art_semanticturkey.newProject= function(){
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.fromFile = false;
	parameters.newProject = false;
	parameters.newProjectName = "";
	parameters.newProjectType = "";
	
	art_semanticturkey.DisabledAllButton(true);
	
	window.openDialog(
			"chrome://semantic-turkey/content/projects/newProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
				
	art_semanticturkey.DisabledAllButton(false);
		
	if(parameters.newProject == true){
		var newProjectName = parameters.newProjectName;
		var newProjectType = parameters.newProjectType;
		art_semanticturkey.CurrentProject.setCurrentProjet(newProjectName, false, false, newProjectType);
		art_semanticturkey.properClose();
		art_semanticturkey.projectOpened(newProjectName);
	}		
};


art_semanticturkey.newProjectFromFile= function(){
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.fromFile = true;
	parameters.newProject = false;
	parameters.newProjectName = "";
	parameters.newProjectType = "";
	
	art_semanticturkey.DisabledAllButton(true);
	
	window.openDialog(
			"chrome://semantic-turkey/content/projects/newProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	
	art_semanticturkey.DisabledAllButton(false);
	
	if(parameters.newProject == true){
		var newProjectName = parameters.newProjectName;
		var newProjectType = parameters.newProjectType;
		art_semanticturkey.CurrentProject.setCurrentProjet(newProjectName, false, false, newProjectType);
		art_semanticturkey.properClose();
		art_semanticturkey.projectOpened(newProjectName);
	}	
};


art_semanticturkey.deleteProject= function(){
	var tree = document.getElementById("projectsTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Project");
		return;
	}
	var currentElement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentElement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var projectName = treecell.getAttribute("label");
	
	try{
		if(projectName == art_semanticturkey.CurrentProject.getProjectName()){
			alert("You cannot delete the project "+projectName+" because it's the current project"+
			"\nLoad another project and then you can delete this one");
			return;
		}
		var responseXML = art_semanticturkey.STRequests.Projects.deleteProject(
				projectName);
		art_semanticturkey.deleteProject_RESPONSE(responseXML, projectName);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
	}
};

art_semanticturkey.deleteProject_RESPONSE = function(responseElement, projectName){
	art_semanticturkey.populateProjectsList();
};


art_semanticturkey.cloneProject= function(){
	var tree = document.getElementById("projectsTree");
	var range = tree.view.selection.getRangeCount();
	if (range <= 0) {
		alert("Please Select a Project");
		return;
	}
	var currentElement = tree.treeBoxObject.view
			.getItemAtIndex(tree.currentIndex);
	var treerow = currentElement.getElementsByTagName('treerow')[0];
	var treecell = treerow.getElementsByTagName('treecell')[0];
	var projectName = treecell.getAttribute("label");
	
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.projectName = projectName;
	parameters.clonedProject = false;
		
	window.openDialog(
			"chrome://semantic-turkey/content/projects/cloneProject.xul",
			"_blank", "modal=yes,resizable,centerscreen", parameters);
	
	if(parameters.clonedProject == true){
		art_semanticturkey.populateProjectsList(); 
	}
};

art_semanticturkey.closeAndRestartFirefox = function(){
	var risp = confirm("Restart Firefox?");
	if (risp) {
		art_semanticturkey.properClose();
		window.arguments[0].parentWindow.art_semanticturkey.restartFirefox();
	}
	
};


art_semanticturkey.close = function() {
	art_semanticturkey.properClose ();
};

art_semanticturkey.properClose = function(){
	window.arguments[0].properClose = true;
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("openProject").disabled = disabled;
	document.getElementById("openMainProject").disabled = disabled;
	document.getElementById("imporProject").disabled = disabled;
	document.getElementById("newProject").disabled = disabled;
	document.getElementById("newProjectFromFile").disabled = disabled;
	document.getElementById("deleteProject").disabled = disabled;
	document.getElementById("cloneProject").disabled = disabled;
	
	document.getElementById("close").disabled = disabled;
	document.getElementById("restartFirefox").disabled = disabled;
	
	//check if there is a loaded project, so the user can exit this window using the close button
	if(art_semanticturkey.CurrentProject.isNull() == true){
		document.getElementById("close").disabled = true;
	}
};

