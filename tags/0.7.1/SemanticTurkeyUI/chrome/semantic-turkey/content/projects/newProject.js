if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("newProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
	document.getElementById("projectName").focus();
	
	if(window.arguments[0].fromFile == false){
		document.getElementById("fromFileRow").hidden = true;
	}
	else{
		document.getElementById("dirBtn").addEventListener("click", art_semanticturkey.chooseFile, true);
	}
	
	var responseXML = art_semanticturkey.STRequests.SystemStart.listOntManagers();
	art_semanticturkey.populateTripleStoreMenulist_RESPONSE(responseXML);
};

art_semanticturkey.populateTripleStoreMenulist_RESPONSE = function(responseElement){
	var repList = responseElement.getElementsByTagName('Repository');
	var tripleStoreMenupopup = document.getElementById("tripleStoreMenupopup");
	
	for ( var i = 0; i < repList.length; i++) {
		var repositoryName = repList[i].getAttribute("repName");
		var repositoryNameReduced = repositoryName.substring(repositoryName.lastIndexOf('.') + 1);
		
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id",repositoryName);
		menuitem.setAttribute("label",repositoryNameReduced);
		tripleStoreMenupopup.appendChild(menuitem);
		if(i==0){
			document.getElementById("tripleStoreMenulist").selectedItem = menuitem;
		}
		
	}
}

art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	var projectName = document.getElementById("projectName").value;
	var uri = document.getElementById("uri").value;
	var tripleStore = document.getElementById("tripleStoreMenulist").selectedItem.getAttribute("id");
	var mode = document.getElementById("modeMenulist").selectedItem.getAttribute("id");
	var srcLocalFile = document.getElementById("srcLocalFile").value;
	
	if((projectName == "") || (uri == "")){
		alert("Please specify a name and a URI for the project");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	var isurl = art_semanticturkey.isUrl(uri);
	if (isurl == false) {
		alert("please type a valid URI \n An example of valid URI is: http://myontology");
		art_semanticturkey.DisabledAllButton(false);
		return;
		
	}
	if ((window.arguments[0].fromFile == true) && (srcLocalFile == "")){
		alert("Please specify a rdf/owl file for the project");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	try{
		window.arguments[0].parentWindow.art_semanticturkey.closeProject();
		var responseXML;
		if(window.arguments[0].fromFile == false){
			responseXML = art_semanticturkey.STRequests.Projects.newProject(
				projectName,
				uri,
				tripleStore,
				mode);
		}
		else{
			responseXML = art_semanticturkey.STRequests.Projects.newProjectFromFile(
				projectName,
				uri,
				tripleStore,
				mode,
				srcLocalFile);
		}
		art_semanticturkey.newProject_RESPONSE(responseXML, projectName, mode);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.newProject_RESPONSE = function(responseElement, projectName, type){
	window.arguments[0].newProject = true;
	window.arguments[0].newProjectName = projectName;
	window.arguments[0].newProjectType = type;
	close();
};

art_semanticturkey.cancel = function() {
	close();
};

art_semanticturkey.DisabledAllButton = function(disabled){
	document.getElementById("newProject").disabled = disabled;
	document.getElementById("cancel").disabled = disabled;
	document.getElementById("dirBtn").disabled = disabled;
};