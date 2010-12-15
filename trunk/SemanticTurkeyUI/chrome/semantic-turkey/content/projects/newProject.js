if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_Projects.jsm",
		art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_SystemStart.jsm", art_semanticturkey);
Components.utils.import("resource://stservices/SERVICE_OntManager.jsm",
		art_semanticturkey);

window.onload = function(){
	
	document.getElementById("newProject").addEventListener("command", art_semanticturkey.onAccept, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	document.getElementById("openConf").addEventListener("command", art_semanticturkey.openConfiguration, true);
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
	
	var menuitem = document.createElement("menuitem");
	menuitem.setAttribute("id","---");
	menuitem.setAttribute("label","---");
	tripleStoreMenupopup.appendChild(menuitem);
	document.getElementById("tripleStoreMenulist").selectedItem = menuitem;
	
	for ( var i = 0; i < repList.length; i++) {
		var repositoryName = repList[i].getAttribute("repName");
		var repositoryNameReduced = repositoryName.substring(repositoryName.lastIndexOf('.') + 1);
		
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("id",repositoryName);
		menuitem.setAttribute("label",repositoryNameReduced);
		menuitem.addEventListener("command", art_semanticturkey.setOntManager, true);
		tripleStoreMenupopup.appendChild(menuitem);
		
	}
};


art_semanticturkey.setOntManager = function(){
	var selectedItem = document.getElementById("tripleStoreMenulist").selectedItem;
	var repositoryName = selectedItem.getAttribute("id");
	var responseXML = art_semanticturkey.STRequests.OntManager.getOntManagerParameters(repositoryName);
	art_semanticturkey.setOntManager_RESPONSE(responseXML);
};

art_semanticturkey.setOntManager_RESPONSE = function(responseElement){
	var modeMenupopup = document.getElementById("modeMenupopup");
	var configurationNodeList = responseElement.getElementsByTagName("configuration");
	//first of all remove all the menuitem
	while (modeMenupopup.hasChildNodes()) {
		modeMenupopup.removeChild(modeMenupopup.lastChild);
	}
	//Then add the new menuitem
	for(var i=0; i<configurationNodeList.length; ++i){
		var parNodeList = configurationNodeList[i].getElementsByTagName("par");
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute("label", configurationNodeList[i].getAttribute("shortName"));
		menuItem.shortName = configurationNodeList[i].getAttribute("shortName");
		menuItem.editRequired = configurationNodeList[i].getAttribute("editRequired");
		menuItem.typeOntMgr = configurationNodeList[i].getAttribute("type");
		menuItem.par = new Array();
		for(var k=0; k<parNodeList.length; ++k){
			menuItem.par[k] = new Object();
			menuItem.par[k].description = parNodeList[k].getAttribute("description");
			menuItem.par[k].name = parNodeList[k].getAttribute("name");
			menuItem.par[k].required = parNodeList[k].getAttribute("required");
			menuItem.par[k].value = parNodeList[k].textContent;
		}
		modeMenupopup.appendChild(menuItem);
		if(i == 0)
			document.getElementById("modeMenulist").selectedItem = menuItem;
	}
	document.getElementById("modeMenulist").setAttribute("disabled", false);
	document.getElementById("openConf").setAttribute("disabled", false);
};

art_semanticturkey.openConfiguration = function(){
	var selectedItem = document.getElementById("modeMenulist").selectedItem;
	var repositoryName = selectedItem.getAttribute("id");
	var parameters = new Object();
	parameters.parentWindow = window;
	parameters.shortName = selectedItem.shortName;
	parameters.editRequired = selectedItem.editRequired;
	parameters.typeOntMgr = selectedItem.tyoeOntMgr;
	parameters.parArray = selectedItem.par;
	parameters.saved = false;
	
	window.openDialog("chrome://semantic-turkey/content/projects/configurationOntMgr.xul", "_blank",
		"chrome,dependent,dialog,modal=yes,resizable,centerscreen", 
		parameters);
	
	return parameters.saved;

};

art_semanticturkey.onAccept = function() {
	art_semanticturkey.DisabledAllButton(true);
	
	if(document.getElementById("modeMenulist").getAttribute("disabled") == "true" ){
		art_semanticturkey.DisabledAllButton(false);
		alert("Please select a Triple Store");
		return;
	}
	//check if this configuration has the attribute editRequired set to true, if so open the configurationOntMgr
	var selectedItem = document.getElementById("modeMenulist").selectedItem;
	if(selectedItem.editRequired == "true"){
		if(art_semanticturkey.openConfiguration() == false){
			art_semanticturkey.DisabledAllButton(false);
			return;
		}
	}
	
	var projectName = document.getElementById("projectName").value;
	var ontologyType = document.getElementById("ontologyTypeMenulist").selectedItem.getAttribute("value");
	var uri = document.getElementById("uri").value;
	var tripleStore = document.getElementById("tripleStoreMenulist").selectedItem.getAttribute("id");
	var ontMgrConfiguration = document.getElementById("modeMenulist").selectedItem.typeOntMgr;
	var srcLocalFile = document.getElementById("srcLocalFile").value;
	
	
	if((projectName == "") || (uri == "")){
		alert("Please specify a name and a URI for the project");
		art_semanticturkey.DisabledAllButton(false);
		return;
	}
	if(ontologyType == ""){
		alert("Please specify a project type");
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
	//prepare the array containing all the parameters for the selected configuration
	var cfgParsArray = new Array();
	var completecfsArray = document.getElementById("modeMenulist").selectedItem.par;
	for(var i=0; i<completecfsArray.length; ++i){
		cfgParsArray[i] = new Object();
		cfgParsArray[i].name = completecfsArray[i].name;
		cfgParsArray[i].value = completecfsArray[i].value;
	}
	try{
		window.arguments[0].parentWindow.art_semanticturkey.closeProject();
		var responseXML;
		if(window.arguments[0].fromFile == false){
			responseXML = art_semanticturkey.STRequests.Projects.newProject(
				projectName,
				ontologyType,
				uri,
				tripleStore,
				ontMgrConfiguration,
				cfgParsArray);
		}
		else{
			responseXML = art_semanticturkey.STRequests.Projects.newProjectFromFile(
				projectName,
				ontologyType,
				uri,
				tripleStore,
				ontMgrConfiguration,
				cfgParsArray,
				srcLocalFile);
		}
		art_semanticturkey.newProject_RESPONSE(responseXML, projectName, ontologyType);
	}
	catch (e) {
		alert(e.name + ": " + e.message);
		art_semanticturkey.DisabledAllButton(false);
	}
};

art_semanticturkey.newProject_RESPONSE = function(responseElement, projectName, ontologyType){
	window.arguments[0].newProject = true;
	window.arguments[0].newProjectName = projectName;
	window.arguments[0].newProjectOntoType = ontologyType;
	var type = responseElement.getElementsByTagName("type")[0].textContent;
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